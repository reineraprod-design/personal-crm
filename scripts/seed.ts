// Fills an empty database with realistic test contacts.
// Refuses to run if contacts already exist, so real data is never touched.
import { count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getDatabaseUrl, loadEnvFile } from "../src/db/env";
import { contacts, notes } from "../src/db/schema";

const CONTACT_COUNT = 1000;
const BATCH_SIZE = 250;

// Deterministic PRNG (mulberry32): every run produces the same data
function createRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = createRandom(20261106);
const pick = <T>(items: readonly T[]): T => items[Math.floor(random() * items.length)];
const chance = (probability: number) => random() < probability;
const digits = (length: number) =>
  Array.from({ length }, () => Math.floor(random() * 10)).join("");

const maleNames = [
  "Александр", "Алексей", "Андрей", "Антон", "Артём", "Борис", "Вадим", "Валерий",
  "Василий", "Виктор", "Виталий", "Владимир", "Владислав", "Вячеслав", "Георгий", "Глеб",
  "Григорий", "Даниил", "Денис", "Дмитрий", "Евгений", "Егор", "Иван", "Игорь", "Илья",
  "Кирилл", "Константин", "Леонид", "Максим", "Марк", "Матвей", "Михаил", "Никита",
  "Николай", "Олег", "Павел", "Пётр", "Роман", "Руслан", "Семён", "Сергей", "Станислав",
  "Степан", "Тимур", "Фёдор", "Юрий", "Ярослав",
];

const femaleNames = [
  "Алёна", "Алина", "Алиса", "Анастасия", "Анна", "Валентина", "Валерия", "Вера",
  "Вероника", "Виктория", "Галина", "Дарья", "Диана", "Евгения", "Екатерина", "Елена",
  "Елизавета", "Жанна", "Зоя", "Инна", "Ирина", "Карина", "Кира", "Ксения", "Лариса",
  "Лидия", "Любовь", "Людмила", "Маргарита", "Марина", "Мария", "Милана", "Надежда",
  "Наталья", "Нина", "Оксана", "Олеся", "Ольга", "Полина", "Светлана", "Софья", "Таисия",
  "Татьяна", "Ульяна", "Юлия", "Яна",
];

// Male surname forms; female forms are derived in femaleSurname()
const surnames = [
  "Иванов", "Смирнов", "Кузнецов", "Попов", "Васильев", "Петров", "Соколов", "Михайлов",
  "Новиков", "Фёдоров", "Морозов", "Волков", "Алексеев", "Лебедев", "Семёнов", "Егоров",
  "Павлов", "Козлов", "Степанов", "Николаев", "Орлов", "Андреев", "Макаров", "Никитин",
  "Захаров", "Зайцев", "Соловьёв", "Борисов", "Яковлев", "Григорьев", "Романов",
  "Воробьёв", "Сергеев", "Кузьмин", "Фролов", "Александров", "Дмитриев", "Королёв",
  "Гусев", "Киселёв", "Ильин", "Максимов", "Поляков", "Сорокин", "Виноградов", "Ковалёв",
  "Белов", "Медведев", "Антонов", "Тарасов", "Жуков", "Баранов", "Филиппов", "Комаров",
  "Давыдов", "Беляев", "Герасимов", "Богданов", "Осипов", "Сидоров", "Матвеев", "Титов",
  "Марков", "Миронов", "Крылов", "Куликов", "Карпов", "Власов", "Мельников", "Денисов",
  "Гаврилов", "Тихонов", "Казаков", "Афанасьев", "Данилов", "Савельев", "Тимофеев",
  "Фомин", "Чернов", "Абрамов", "Мартынов", "Ефимов", "Федотов", "Щербаков", "Назаров",
  "Калинин", "Исаев", "Чернышёв", "Быков", "Маслов", "Родионов", "Коновалов", "Лазарев",
  "Воронин", "Климов", "Филатов", "Пономарёв", "Голубев", "Кудрявцев", "Прохоров",
  "Наумов", "Потапов", "Журавлёв", "Овчинников", "Трофимов", "Леонов", "Соболев",
  "Ермаков", "Колесников", "Гончаров", "Емельянов", "Никифоров", "Грачёв", "Котов",
  "Гришин", "Ефремов", "Архипов", "Громов", "Кириллов", "Малышев", "Панов", "Моисеев",
  "Румянцев", "Акимов", "Кондратьев", "Бирюков", "Горбунов", "Анисимов", "Тихомиров",
  "Галкин", "Лукьянов", "Скворцов", "Юдин", "Белоусов", "Нестеров", "Симонов",
  "Харитонов", "Князев", "Цветков", "Левин", "Воронов", "Аксёнов", "Мальцев", "Логинов",
  "Горшков", "Савин", "Майоров", "Сазонов", "Островский", "Покровский", "Вишневский",
  "Добровольский", "Шевченко", "Бондаренко", "Ткаченко", "Кравченко", "Лысенко",
];

function femaleSurname(surname: string) {
  if (surname.endsWith("ский")) return `${surname.slice(0, -4)}ская`;
  if (/(ов|ев|ёв|ин|ын)$/.test(surname)) return `${surname}а`;
  return surname;
}

const roles = [
  "Дизайнер интерфейсов, работает на фрилансе",
  "Бывший коллега, сейчас руководит отделом в банке",
  "Сосед по даче",
  "Тренер по плаванию",
  "Друг детства",
  "Стоматолог, принимает в клинике на Профсоюзной",
  "Риелтор, помогает с покупкой квартиры",
  "Фотограф, снимает свадьбы и семейные истории",
  "Юрист, консультирует по договорам",
  "Родитель одноклассника сына",
  "Однокурсник, работает в IT-компании",
  "Бухгалтер, ведёт ИП",
  "Психолог",
  "Автомеханик, чинит машину уже несколько лет",
  "Преподаватель английского",
  "Основатель небольшой кофейни",
  "Программист, бэкенд",
  "Продакт-менеджер в маркетплейсе",
  "Врач-терапевт",
  "Классный руководитель дочери",
  "Архитектор",
  "Владелец столярной мастерской",
  "Журналист, пишет про технологии",
  "Маркетолог",
  "HR в крупной компании, помогает с вакансиями",
  "Инструктор по йоге",
  "Сосед по лестничной клетке",
  "Музыкант, играет в джазовом трио",
  "Ветеринар, лечит нашего кота",
  "Финансовый консультант",
  "Бывший руководитель, хороший ментор",
  "Организатор конференций",
  "Переводчик с немецкого",
  "Повар, шеф в ресторане",
  "Аналитик данных",
  "Строитель, ремонтирует квартиры",
  "Агент по туризму",
  "Дальний родственник",
  "Партнёр по теннису",
  "Бывший стажёр нашей команды",
  "Инвестор, интересуется стартапами",
  "Кондитер, печёт торты на заказ",
  "Нотариус",
  "Мастер маникюра",
  "Водитель, возит в аэропорт",
  "Иллюстратор детских книг",
];

const meetings = [
  "Учились вместе в университете",
  "Познакомились на конференции в Казани",
  "Через общих друзей на дне рождения",
  "Работали вместе в прошлой компании",
  "Соседи по подъезду",
  "Ходили вместе в поход на Алтай",
  "На курсах английского",
  "В спортзале",
  "Посоветовали знакомые",
  "На свадьбе у друзей",
  "В чате жильцов дома",
  "На митапе по продуктовому дизайну",
  "Летели рядом в самолёте из Сочи",
  "Родители дружат много лет",
  "Учились в одном классе",
  "Познакомились в отпуске в Грузии",
  "На родительском собрании",
  "Через работу: были подрядчиком на проекте",
  "На волонтёрской акции в парке",
  "В очереди на концерт",
  "На корпоративе общих знакомых",
  "Познакомились через объявление о продаже велосипеда",
  "Записывались на приём, так и познакомились",
  "На хакатоне",
  "Вместе снимали квартиру в студенчестве",
  "На мастер-классе по керамике",
  "В детском лагере",
  "На собеседовании — потом подружились",
];

const topics = [
  "переезд в Петербург",
  "новую работу",
  "поездку в Грузию",
  "ремонт квартиры",
  "идею совместного проекта",
  "поступление дочери в университет",
  "покупку машины",
  "запуск своего дела",
  "здоровье родителей",
  "свадьбу в следующем году",
  "книгу, которую сейчас читает",
  "смену профессии",
  "курсы по программированию",
  "отпуск на Байкале",
  "участие в марафоне",
  "дачу и урожай",
  "выставку, на которую ходили",
  "новый сериал",
];

const agreements = [
  "встретиться после праздников",
  "созвониться в конце месяца",
  "что я пришлю контакты хорошего юриста",
  "сходить вместе на концерт",
  "обменяться книгами",
  "что я помогу с резюме",
  "съездить вместе на рыбалку летом",
  "что пришлёт рецепт того самого пирога",
  "познакомить с моим бывшим руководителем",
  "вернуться к разговору через пару недель",
  "что я напишу, когда буду в их городе",
  "поздравить с днём рождения в мае",
  "что одолжу палатку на выходные",
  "посмотреть вместе квартиры в выходные",
];

const facts = [
  "не ест мясо",
  "аллергия на орехи",
  "двое детей, сын и дочь",
  "любит джаз и винил",
  "болеет за «Зенит»",
  "день рождения в марте",
  "день рождения в октябре",
  "не пьёт кофе, только чай",
  "собака — лабрадор по кличке Боня",
  "лучше писать в мессенджер, звонки не любит",
  "собирает марки",
  "по выходным на даче, связь плохая",
];

const noteTemplates: Array<() => string> = [
  () => `Созвонились, обсудили ${pick(topics)}. Договорились ${pick(agreements)}.`,
  () => `Встретились на кофе. Много говорили про ${pick(topics)}.`,
  () => `Переписывались про ${pick(topics)}. Договорились ${pick(agreements)}.`,
  () => `Важно помнить: ${pick(facts)}.`,
  () => `Виделись на дне рождения общих друзей. Договорились ${pick(agreements)}.`,
  () => `Коротко созвонились. Всё хорошо, обсудили ${pick(topics)}.`,
];

const translit: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i",
  й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t",
  у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y", ь: "",
  э: "e", ю: "yu", я: "ya",
};

const toLatin = (text: string) =>
  [...text.toLowerCase()].map((char) => translit[char] ?? char).join("");

const emailDomains = ["gmail.com", "yandex.ru", "mail.ru", "ya.ru", "icloud.com", "outlook.com"];

function makeEmail(firstName: string, lastName: string) {
  const first = toLatin(firstName);
  const last = toLatin(lastName);
  const local = pick([
    `${first}.${last}`,
    `${first[0]}${last}`,
    `${last}.${first}`,
    `${first}${digits(2)}`,
    `${last}${digits(4)}`,
  ]);
  return `${local}@${pick(emailDomains)}`;
}

function makePhone() {
  return `+7 9${digits(2)} ${digits(3)}-${digits(2)}-${digits(2)}`;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const now = Date.now();
const randomDateBetween = (from: number, to: number) => new Date(from + random() * (to - from));

type NewContact = typeof contacts.$inferInsert;
type NewNote = Omit<typeof notes.$inferInsert, "contactId">;

function makeContact(): { contact: NewContact; notes: NewNote[] } {
  const isFemale = chance(0.5);
  const firstName = pick(isFemale ? femaleNames : maleNames);
  const surname = pick(surnames);
  const lastName = isFemale ? femaleSurname(surname) : surname;

  const createdAt = randomDateBetween(now - 3 * 365 * DAY_MS, now - 7 * DAY_MS);
  const noteCount = pick([0, 0, 1, 1, 1, 2, 2, 3, 4]);
  const noteDates = Array.from({ length: noteCount }, () =>
    randomDateBetween(createdAt.getTime(), now - DAY_MS),
  ).sort((a, b) => a.getTime() - b.getTime());

  return {
    contact: {
      name: `${firstName} ${lastName}`,
      about: chance(0.9) ? pick(roles) : null,
      howWeMet: chance(0.85) ? pick(meetings) : null,
      phone: chance(0.85) ? makePhone() : null,
      email: chance(0.75) ? makeEmail(firstName, lastName) : null,
      createdAt,
      updatedAt: noteDates.at(-1) ?? createdAt,
    },
    notes: noteDates.map((createdAt) => ({ body: pick(noteTemplates)(), createdAt })),
  };
}

async function main() {
  loadEnvFile();
  const client = postgres(getDatabaseUrl(), { max: 1 });
  const db = drizzle(client);

  try {
    const [{ value: existing }] = await db.select({ value: count() }).from(contacts);
    if (existing > 0) {
      console.log(`Database already has ${existing} contacts, seeding skipped.`);
      return;
    }

    const generated = Array.from({ length: CONTACT_COUNT }, makeContact);

    await db.transaction(async (tx) => {
      for (let start = 0; start < generated.length; start += BATCH_SIZE) {
        const batch = generated.slice(start, start + BATCH_SIZE);
        const inserted = await tx
          .insert(contacts)
          .values(batch.map((item) => item.contact))
          .returning({ id: contacts.id });

        const batchNotes = batch.flatMap((item, index) =>
          item.notes.map((note) => ({ ...note, contactId: inserted[index].id })),
        );
        if (batchNotes.length > 0) await tx.insert(notes).values(batchNotes);
      }
    });

    const noteTotal = generated.reduce((sum, item) => sum + item.notes.length, 0);
    console.log(`Seeded ${generated.length} contacts and ${noteTotal} notes.`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
