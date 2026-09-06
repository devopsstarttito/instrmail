/* Инструкции работают без сборки, запросов к серверу и ES-модулей. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MailGuides = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const docs = "https://yandex.ru/support/yandex-360/business/mail/ru/mail-clients/";
  const clients = [
    {id:"outlook", name:"Outlook", os:["windows","macos"], mark:"O", source:docs+"microsoft-outlook"},
    {id:"thunderbird", name:"Thunderbird", os:["windows","macos","linux"], mark:"T", source:docs+"mozilla-thunderbird"},
    {id:"bat", name:"The Bat!", os:["windows"], mark:"B", source:docs+"the-bat"},
    {id:"apple", name:"Apple Mail", os:["macos"], mark:"mail", source:docs+"apple-mail"},
    {id:"web", name:"Веб-почта", os:["windows","macos","linux"], mark:"Я", source:"https://yandex.ru/support/yandex-360/business/mail/ru/"}
  ];
  const osNames = {windows:"Windows", macos:"macOS", linux:"Linux"};
  const protocolNames = {imap:"IMAP", pop3:"POP3", unknown:"Тип подключения неизвестен"};
  const escape = text => String(text).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  function safeUrl(value, fallback = "") {
    try { const url = new URL(value); return url.protocol === "https:" ? url.href : fallback; }
    catch (_) { return fallback; }
  }
  const link = (url, text) => `<a class="nowrap-link" href="${escape(safeUrl(url, "https://mail.yandex.ru/"))}" target="_blank" rel="noopener noreferrer">${text} ↗</a>`;
  const path = text => `<div class="path">${text}</div>`;
  const note = (title, body, kind="amber") => `<div class="notice notice-${kind}"><span class="notice-icon" aria-hidden="true">${kind==="amber"?"!":"i"}</span><div><strong>${title}</strong><p>${body}</p></div></div>`;
  const settings = `<div class="step-settings"><div><strong>Входящая · IMAP</strong><code>imap.yandex.ru</code>Порт 993 · SSL/TLS</div><div><strong>Исходящая · SMTP</strong><code>smtp.yandex.ru</code>Порт 465 · SSL/TLS</div></div><p>В обоих случаях логин — <strong>полный рабочий адрес</strong>, пароль — <strong>пароль приложения</strong>. Для SMTP обязательно включите авторизацию.</p>`;

  function validate(selection) {
    if (!selection || !Object.hasOwn(osNames, selection.os) || !Object.hasOwn(protocolNames, selection.protocol)) throw new Error("Выберите ОС и тип старого подключения.");
    const client = clients.find(item => item.id === selection.client);
    if (!client || !client.os.includes(selection.os)) throw new Error("Эта программа недоступна для выбранной ОС.");
    if (selection.client === "outlook" && selection.os === "windows" && !["classic","new"].includes(selection.outlook)) throw new Error("Выберите версию Outlook.");
    return client;
  }
  function detection(selection) {
    if (selection.client === "outlook") {
      if (selection.os === "macos") return "Outlook → Настройки → Учётные записи. Выберите старый ящик и посмотрите тип учётной записи. В прежних версиях это меню «Сервис → Учётные записи».";
      if (selection.outlook === "new") return "Откройте Параметры → Учётные записи → Ваши учётные записи → Управление. Если тип не указан, оставьте «Не знаю». Для старого POP3-архива проверьте программу, которой пользовались до перехода.";
      return "Файл → Настройка учётных записей → Настройка учётных записей → Электронная почта. Тип указан в столбце «Тип» напротив старого ящика.";
    }
    return ({thunderbird:"Меню ☰ → Параметры учётной записи → старый ящик → Параметры сервера. Посмотрите строку «Тип сервера»: IMAP или POP.",bat:"Ящик → Свойства (или «Настройки почтового ящика») → Транспорт. Посмотрите протокол получения почты.",apple:"Почта → Настройки → Учётные записи. Выберите старый ящик и посмотрите тип на вкладке «Информация» или «Настройки сервера»."})[selection.client] || "Выберите программу — здесь появится подсказка. Если сомневаетесь, оставьте «Не знаю».";
  }
  function safety(selection) {
    if (selection.client === "web") return note("Старую программу можно оставить как есть", "Для входа через браузер не нужно менять или удалять старую учётную запись. Локальные архивы останутся на компьютере.", "blue");
    if (selection.protocol === "pop3") return note("POP3: не удаляйте старую учётную запись", "Часть писем может храниться только на компьютере. Сохраните резервную копию, затем добавьте Яндекс как отдельный IMAP-аккаунт. Не меняйте тип старого POP3-ящика.");
    if (selection.protocol === "unknown") return note("Не удаляйте старую учётную запись", "Пока тип подключения неизвестен, считайте, что в ней могут быть локальные письма. Сохраните архив и добавьте новый ящик отдельно. Если видите Exchange или Microsoft 365, согласуйте изменение с ИТ-службой.");
    return note("Сначала проверим переписку", "Даже у IMAP-ящика могут быть локальные папки. Сохраните их и проверьте перенос в веб-почте. В этой инструкции новый аккаунт добавляется отдельно, чтобы сохранить старый до проверки.", "blue");
  }
  function backup(selection) {
    if (selection.client === "outlook") {
      if (selection.os === "windows" && selection.outlook === "classic") return `<p>В классическом Outlook откройте <strong>Файл → Настройка учётных записей → Настройка учётных записей → Файлы данных</strong>. Сохраните сведения о расположении файлов.</p><p>Если у старого ящика есть файл <strong>.pst</strong>, полностью закройте Outlook и сделайте копию этого файла в согласованную с ИТ-службой папку. Не перемещайте оригинал. Файл <strong>.ost</strong> — кэш, его копия не заменяет экспорт писем: попросите ИТ-службу помочь с архивом.</p>`;
      return `<p>Сохраните старую программу и её профиль. Попросите ИТ-службу сделать резервную копию локальных папок и проверить доступ к старому архиву, особенно если раньше использовался классический Outlook с PST.</p><p>Не переключайте профиль и не удаляйте старый аккаунт до этой проверки.</p>`;
    }
    if (selection.client === "thunderbird") return `<p>В Thunderbird откройте <strong>☰ → Инструменты → Экспорт</strong> и сохраните копию профиля. Для профиля больше 2 ГБ используйте копирование папки профиля по ${link("https://support.mozilla.org/ru/kb/eksport-profilya-thunderbird", "инструкции Thunderbird")} или попросите ИТ-службу помочь. Если данные хранятся вне профиля, их нужно скопировать отдельно.</p><p>Сохраните копию в согласованном месте. Она содержит почту и настройки аккаунтов.</p>`;
    if (selection.client === "apple") return `<p>В приложении «Почта» выделите старые локальные ящики, особенно в разделе <strong>«На моём Mac»</strong>, затем выберите <strong>Ящик → Экспортировать почтовый ящик</strong>. Сохраните копии в согласованной папке.</p><p>Проверьте, что все нужные папки попали в экспорт. ${link("https://support.apple.com/ru-ru/guide/mail/mlhlp1030/mac", "Как экспортировать ящик")}.</p>`;
    return `<p>В The Bat! используйте команду резервного копирования в меню <strong>Инструменты</strong>. Включите старый ящик, его письма и настройки, сохраните архив в согласованную папку.</p><p>Перед продолжением убедитесь, что копия создана. Если пункты меню отличаются, откройте ${link("https://www.ritlabs.com/ru/support/help/", "справочник The Bat!")} → «Резервное копирование».</p>`;
  }
  function accountSteps(selection) {
    const duplicate = note("Если адрес уже добавлен", "Не удаляйте старую запись. Откройте раздел «Не получилось?» ниже: ИТ-служба поможет создать отдельный профиль или изменить подтверждённый IMAP-аккаунт после проверки архива.");
    if (selection.client === "outlook" && selection.os === "windows" && selection.outlook === "classic") return {
      add: path("Файл → Добавить учётную запись") + `<p>Введите рабочий адрес. Откройте дополнительные параметры, включите <strong>«Настроить учётную запись вручную»</strong> и выберите подключение <strong>IMAP</strong>.</p>` + duplicate,
      configure:settings+`<p>Введите серверы и порты, выберите SSL/TLS. Введите пароль приложения и завершите подключение. Если доступна настройка <strong>SPA</strong> (безопасная проверка пароля), оставьте её выключенной; шифрование SSL/TLS должно быть включено.</p><p>В дополнительных параметрах исходящего сервера включите проверку подлинности с теми же данными, что для входящей почты. Проверьте результат встроенной проверки Outlook.</p>`
    };
    if (selection.client === "outlook" && selection.os === "windows") return {
      add: path("Параметры → Учётные записи → Ваши учётные записи → Добавить учётную запись")+`<p>Введите рабочий адрес. Если автоматическое подключение не сработало, выберите расширенную настройку и <strong>IMAP</strong>, если этот вариант доступен в вашей версии.</p>`+duplicate,
      configure:settings+`<p>В расширенных параметрах укажите оба сервера, порты и SSL/TLS, затем пароль приложения. Если приложение предлагает синхронизацию через Microsoft Cloud, продолжайте только если такой способ разрешён в вашей организации.</p>`+note("Если ручной настройки нет", "Используйте веб-почту и обратитесь в ИТ-службу: она подскажет разрешённую версию Outlook или другой клиент. Не удаляйте старый профиль, чтобы обойти ошибку.","blue")
    };
    if (selection.client === "outlook") return {
      add:path("Outlook → Настройки → Учётные записи → Добавить учётную запись")+`<p>Введите рабочий адрес. Если автоматическая настройка не подходит, выберите <strong>IMAP</strong> в выборе провайдера или типов аккаунта. В старом интерфейсе путь может начинаться с «Сервис → Учётные записи → +».</p>`+duplicate,
      configure:settings+`<p>Включите SSL для обоих серверов. Если порты недоступны для редактирования, включите переопределение порта по умолчанию. Для отправки выберите авторизацию с данными входящей почты.</p><p>Если ваша версия предлагает Microsoft Cloud, используйте только способ подключения, разрешённый ИТ-службой. Если нужных параметров нет, временно откройте веб-почту.</p>`
    };
    if (selection.client === "thunderbird") return {
      add:path("☰ → Настройка учётных записей → Добавить учётную запись почты")+`<p>В некоторых версиях: <strong>Параметры учётной записи → Действия для учётной записи → Добавить учётную запись почты</strong>.</p><p>Укажите имя отправителя, полный рабочий адрес и пароль приложения. Нажмите «Продолжить», затем <strong>«Настроить вручную»</strong>. Для входящей почты выберите IMAP.</p>`+duplicate,
      configure:settings+`<p>В обоих блоках выберите метод аутентификации <strong>«Обычный пароль»</strong>. Несмотря на название метода, введите именно пароль приложения. Проверьте имя пользователя и для IMAP, и для SMTP.</p><p>Нажмите <strong>«Перетестировать»</strong>, затем «Готово». В параметрах нового аккаунта убедитесь, что выбран именно новый SMTP-сервер Яндекса.</p>`
    };
    if (selection.client === "bat") return {
      add:path("Ящик → Новый почтовый ящик")+`<p>Создайте новый ящик с отличающимся названием, например <strong>«Рабочая почта — Яндекс»</strong>. Укажите имя отправителя, полный рабочий адрес и пароль приложения. Выберите получение по <strong>IMAP</strong>.</p>`+duplicate,
      configure:settings+`<p>В The Bat! шифрование называется <strong>«Безопасное по спец. порту (TLS)»</strong>. Выберите его для получения и отправки. Включите <strong>«Мой сервер SMTP требует аутентификации»</strong>.</p><p>В поле пользователя снова укажите полный адрес, завершите мастер. Настройки можно проверить в <strong>Ящик → Свойства → Транспорт</strong>.</p>`
    };
    return {
      add:path("Почта → Добавить учётную запись → Другая учётная запись Почты")+`<p>Укажите имя отправителя, рабочий адрес и пароль приложения. Если программа не может проверить данные автоматически, заполните появившиеся поля вручную. Тип аккаунта — <strong>IMAP</strong>, имя пользователя — полный адрес.</p>`+duplicate,
      configure:settings+path("Почта → Настройки → Учётные записи → новый ящик → Настройки сервера")+`<p>Отключите автоматическое управление параметрами подключения, чтобы указать порты <strong>993</strong> и <strong>465</strong>. Включите TLS/SSL для обоих серверов, выберите аутентификацию паролем и сохраните настройки.</p>`
    };
  }
  function build(selection, config={}) {
    const client=validate(selection);
    const webmail=safeUrl(config.webmailUrl,"https://mail.yandex.ru/");
    const password=safeUrl(config.appPasswordUrl,"https://id.yandex.ru/security/app-passwords");
    const mailSettings=safeUrl(config.mailSettingsUrl,"https://mail.yandex.ru/#setup/client");
    const context=`${osNames[selection.os]} · ${client.name}${selection.client==="outlook"&&selection.os==="windows"?(selection.outlook==="new"?" (новый)":" (классический)"):""}`;
    const verify=`<ol><li>Отправьте письмо на другой доступный вам адрес. Убедитесь, что получатель его получил.</li><li>Ответьте с того адреса и проверьте, что ответ появился в новом ящике.</li><li>Проверьте «Отправленные» и старые папки: важные письма должны быть доступны.</li></ol><p>Если тест не прошёл, откройте <a href="#help">«Не получилось?»</a>. Не удаляйте старый аккаунт, пока ИТ-служба не подтвердит, что вся нужная переписка сохранена.</p>`;
    if (selection.client === "web") return {context,title:"Почта в браузере",safety:safety(selection),source:client.source,steps:[
      {title:"Войдите в рабочую почту",html:`<p>${link(webmail,"Откройте Яндекс Почту")} и войдите с <strong>полным рабочим адресом</strong> и новым обычным паролем, полученным после миграции. При едином входе используйте корпоративную страницу авторизации.</p><p>Проверьте адрес в меню профиля, чтобы не остаться в личном аккаунте. Пароль приложения для браузера не нужен.</p>`,done:"В рабочий ящик удалось войти"},
      {title:"Проверьте переписку",html:`<p>Откройте «Входящие», «Отправленные» и несколько старых папок. Сравните их с прежней почтой. Если чего-то не хватает, сообщите ИТ-службе примеры отсутствующих писем.</p>`+note("Локальные архивы могут остаться на компьютере","Если раньше вы использовали POP3, PST или папки «На моём компьютере», не удаляйте старую программу и её аккаунт. Веб-почта не импортирует эти архивы автоматически."),done:"Переписка проверена"},
      {title:"Проверьте отправку и получение",html:verify,done:"Тестовое письмо отправлено и ответ получен"}
    ]};
    const specific=accountSteps(selection);
    let source=client.source;
    if(selection.client==="outlook"&&selection.os==="macos") source="https://support.microsoft.com/en-US/Outlook/add-an-email-account-to-outlook-for-mac";
    if(selection.client==="outlook"&&selection.os==="windows"&&selection.outlook==="new") source="https://support.microsoft.com/en-us/outlook/getstarted/add-an-email-account-to-outlook-for-windows";
    return {context,title:`Настройка ${client.name}`,safety:safety(selection),source,steps:[
      {title:selection.protocol==="imap"?"Проверьте письма и сохраните архив":"Сохраните старую почту",html:`<p>Сначала ${link(webmail,"войдите в веб-почту")} с полным рабочим адресом и новым обычным паролем. Сравните несколько старых писем и папок. При отсутствии писем сообщите ИТ-службе до изменений.</p>`+backup(selection),done:"Старая почта и резервная копия проверены"},
      {title:"Подготовьте пароль приложения",html:`<ol><li>В рабочем ящике откройте ${link(mailSettings,"настройки «Почтовые программы»")} и разрешите IMAP, а также пароли приложений и OAuth-токены. Сохраните настройки.</li><li>В ${link(password,"Яндекс ID")} выберите создание пароля для <strong>«Почты»</strong>. Дайте ему название вашей программы.</li><li>Скопируйте пароль в почтовую программу. Яндекс показывает его один раз.</li></ol>`+note("Если настройки недоступны","Возможно, доступ управляется организацией. Обратитесь в ИТ-службу и пока пользуйтесь веб-почтой. Если вам уже выдали именно пароль приложения, используйте его; обычный новый пароль для ручного подключения не подходит.","blue")+`<p>Пароль вводится только в почтовой программе или на странице Яндекса. На этом сайте полей для пароля нет.</p>`,done:"IMAP включён, пароль приложения подготовлен"},
      {title:"Добавьте новый ящик отдельно",html:specific.add,done:"Открыта настройка нового IMAP-аккаунта"},
      {title:"Укажите серверы и подключитесь",html:specific.configure,done:"Новый ящик подключён без ошибки"},
      {title:"Проверьте, что всё работает",html:`<p>Дождитесь первой синхронизации: для большого ящика она может занять время. При отправке выберите новый аккаунт в поле <strong>«От кого»</strong>.</p>`+verify,done:"Тестовое письмо отправлено и ответ получен"}
    ]};
  }
  return Object.freeze({clients,osNames,protocolNames,validate,build,detection,safety,safeUrl,escape});
});
