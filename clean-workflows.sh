#!/bin/bash

# Создаем временную директорию
mkdir -p .github-temp/workflows

# Копируем только нужный workflow файл
cp .github/workflows/build-apk.yml .github-temp/workflows/

# Удаляем старую директорию workflows и заменяем ее на новую
rm -rf .github/workflows
mv .github-temp/workflows .github/

# Удаляем временную директорию
rm -rf .github-temp

echo "Очистка workflows завершена. Остался только файл build-apk.yml"
echo "Теперь можно выполнить:"
echo "git add .github"
echo "git commit -m \"Оставлен только один workflow для сборки APK\""
echo "git push"
echo "git tag v1.3.0 && git push --tags"