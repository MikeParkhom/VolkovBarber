# VolkovBarber

Сайт-визитка барбершопа «Волков барбер клуб» (Брянск, ул. Куйбышева, 15А).

Статический сайт без сборки: HTML, CSS и JavaScript. Дизайн в графитово-молочной гамме: 3D-ножницы и опасная бритва (Three.js) летают при прокрутке, разделы раскрываются анимацией (GSAP ScrollTrigger). Библиотеки лежат в `assets/vendor`, внешние CDN не нужны. Разделы: услуги, мастера, работы, онлайн-запись (Яндекс Запись), отзывы, вопросы и контакты с картой.

## Структура

```
index.html            главная страница (вся разметка, SEO, schema.org)
404.html              страница «не найдено»
assets/css/style.css  стили
assets/js/main.js     меню, запись через Яндекс, галерея, анимации прокрутки
assets/js/scene.js    3D-сцена: ножницы и бритва, их полёт по разделам
assets/vendor/        three.js и GSAP
assets/img/           логотип, иконки, фото мастеров и работ
robots.txt            правила для поисковиков и ИИ-ботов
sitemap.xml           карта сайта для Яндекса и Google
llms.txt              краткая справка о клубе для ИИ-ассистентов
site.webmanifest      иконки и цвета для телефона
tools/replace_bg.py   скрипт замены фона на фото
```

## Публикация на GitHub Pages

1. Settings → Pages → Source: **Deploy from a branch**, ветка `main`, папка `/ (root)`.
2. Через минуту сайт будет доступен по адресу `https://mikeparkhom.github.io/VolkovBarber/`.

Если будет свой домен (например, `volkov-barber.ru`), замените адрес
`https://mikeparkhom.github.io/VolkovBarber/` на новый во всех файлах
(`index.html`, `robots.txt`, `sitemap.xml`, `llms.txt`) и добавьте домен в Settings → Pages.
Со своим доменом поисковики будут читать `robots.txt` из корня, это лучше для SEO.

После публикации добавьте сайт в [Яндекс Вебмастер](https://webmaster.yandex.ru/) и
[Google Search Console](https://search.google.com/search-console) и отправьте `sitemap.xml`.

## Как поменять данные

- Цены и услуги: блок `<!-- SERVICES -->` в `index.html`, а также `makesOffer` в schema.org и раздел «Услуги и цены» в `llms.txt`.
- Режим работы: блок «Контакты» в `index.html`, `openingHoursSpecification` в schema.org и `llms.txt`.
- Ссылка на запись: `BOOKING_URL` в `assets/js/main.js` и ссылка в блоке `<!-- BOOKING -->`.

## Фото

Фоны на фотографиях работ и мастеров заменены на однотонный графит `#2d2d30` нейросетью
BiRefNet (портретная модель, через `rembg`). Лица, волосы и одежда не перерисовывались:
меняются только пиксели фона, края волос смешиваются по маске.

```
pip install "rembg[cpu]" pymatting
python tools/replace_bg.py исходник.jpg результат.jpg
```

## Анимации

- Траектории ножниц и бритвы задаются ключевыми кадрами в начале `init()` в `assets/js/scene.js` (отдельно для компьютера и телефона).
- Если в системе включено «Уменьшить движение», анимации отключаются, а 3D остаётся только на первом экране.
