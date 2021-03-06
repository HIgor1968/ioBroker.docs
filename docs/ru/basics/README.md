---
Title: ioBroker Grundlagen
lastChanged: 29.03.2019
translatedFrom: de
translatedWarning: Если вы хотите отредактировать этот документ, удалите поле «translationFrom», в противном случае этот документ будет снова автоматически переведен
editLink: https://github.com/ioBroker/ioBroker.docs/edit/master/docs/ru/basics/README.md
title: модульность
hash: FytBmaiv4NpTHt2T+Wgnbozj+XBc5qr7hLloB/Elo9k=
---
ioBroker - это чистое программное решение для подключения различных систем IoT к полной системе. Соответственно, центральный офис (шлюз / интерфейс) также требуется для каждой системы, чтобы иметь возможность интегрировать свои устройства.

В особых случаях такая панель управления может быть смоделирована программным обеспечением или как аппаратное обеспечение (USB-накопитель или подобное), зараженное сервером ioBroker.

# Модульность
ioBroker имеет модульную структуру. Эти модули называются ioBroker ***Adapter*** .
Есть [более 250 адаптеров](http://download.iobroker.net/list.html) для подключения различного оборудования или интеграции различной информации, такой как погода, календарь и т. Д.

Поэтому в установке должны быть установлены только те адаптеры, которые необходимы для ваших индивидуальных потребностей. Это экономит место для хранения и вычислительную мощность.

Для каждого адаптера создаются так называемые ***экземпляры*** . Это «рабочие версии» адаптеров. В зависимости от адаптера может быть создано любое количество экземпляров, чтобы отличать разные подсистемы или разные области задач друг от друга.

Соответствующая конфигурация имеет место в этих случаях.

# Архитектура
## Сервер
Особенностью ioBroker является то, что задачи также могут быть распределены на несколько серверов ** **. В таком случае говорят о ***многоузловой системе*** . Причинами разделения могут быть пространственное распределение или распределение мощности.

### Требования к оборудованию
Сервер ioBroker можно установить практически на любом оборудовании. Единственным условием является наличие текущей версии [NodeJS](https://nodejs.org) для соответствующей операционной системы.

Для более крупной установки рекомендуется ОЗУ объемом не менее 2 ГБ. Для тестирования достаточно Raspberry Pi 2/3 с 1 ГБ ОЗУ, так как в качестве ведомого устройства для отдельных адаптеров в среде с несколькими хостами иногда достаточно даже небольших миникомпьютеров.

## Программное обеспечение
ioBroker управляет данными в базе данных. Соответственно структура данных организована.

Каждый адаптер имеет так называемое пространство имен, которое содержит все данные об экземпляре адаптера. Соответственно, имя пространства имен, например: ***AdapterName.0***

В этом диапазоне ioBroker создает устройства, их каналы и точки данных со своими значениями (состояниями).

![структура объекта](../../de/basics/../admin/media/ADMIN_Objekte_status_tree.png)

Этот пример представляет собой самостоятельно созданное пространство имен для ваших собственных метрик.