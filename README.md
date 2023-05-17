# Chater

Это простое чат приложение демонстрирующие навыки владения библиотекой React. В нём используются такие приёмы как Strong Typing, State Management, Hooks, Server Side Rendering и другие.

https://github.com/someApprentice/Chater/assets/6327801/dc7c34e6-0133-47b7-9ae5-b6554a9ee83b

## Установка

1.  `npm install`
2.  `cp .env.example .env`
3.  `npm run build`
4.  `node build/server.js`

## Тестирование

`npm run test`

https://github.com/someApprentice/Chater/assets/6327801/24fa543d-a82e-455a-bb84-933f561e3e34

## Особенности

### In-memory Redux database

На backend'е простого демонстрационного frontend-приложения необязательно использовать такие базы данных как PostgreSQL, MySQL или SQLite. Достаточно реализовать простую базу данных, хранящую данные в серверной, или точнее сказать, оперативной памяти. Поэтому, я решил использовать Redux для реализации такой базы данных, в которой состояние Redux (state) является *хранилищем* этой базы данных.

### Passport.js и Argon2

Одной из лучших практик аутентификации на backend-приложении написанном на JS, — это использование библиотеки [Passport.js](https://www.passportjs.org/). К тому же, такая функция формирования ключа как [Argon2](https://en.wikipedia.org/wiki/Argon2) стала победителем конкурса [Password Hashing Competition](https://www.password-hashing.net/) и является рекомендуемой во множествах статей в интернете. Поэтому, целесообразно использовать обе эти лучшие техники.

### Jest и Cypress

Предлагаемое Jest'ом тестовое окружение – jsdom заявляет, что «[является реализацией таких  веб-стандартов, как DOM и HTML, для использования их внутри Node.js](https://github.com/jsdom/jsdom)». Однако, jsdom [не реализует  компоновку  (англ. layout) элементов](https://github.com/jsdom/jsdom#unimplemented-parts-of-the-web-platform), и протестировать изменение состояния свойства overflow у элементов с прокруткой — не представляется возможным. Поэтому, пришлось прибегнуть к использованию ещё одного инструмента как Cypress.

На данный момент, появились такие решения как [Puppeteer](https://pptr.dev/) и [Playwright](https://playwright.dev/), которые решают подобные проблемы и в целом позволяют проводить тесты в настоящем окружении браузера. И сейчас, при выборе инструмента тестирования, я выбрал бы именно их.
