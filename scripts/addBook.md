# 1) Стандарт: 10 страниц, серия NASTAVNIK, авто-слуг
node scripts/addBook.js --title "НАСТАВНИК 11 — Личная Победа"

# 2) Задать кол-во страниц и теги
node scripts/addBook.js --title "Энергия пути" --pages 8 --tags "psychology,practice"

# 3) Латинский slug вручную + год + автор
node scripts/addBook.js --title "Data & Mind" --slug data-and-mind --year 2025 --author "Vitalik"

# 4) Перезаписать существующие болванки (осторожно)
node scripts/addBook.js --title "НАСТАВНИК 12" --force
