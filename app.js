"use strict";
(() => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const guides=window.MailGuides;
  const config=window.MAIL_HELP_CONFIG || {};
  const form=$("#setup-form");
  const esc=guides.escape;
  let currentGuide=null;
  let toastTimer;
  const names=guides.osNames;
  function selection() {
    return {os:form.querySelector('[name="os"]:checked').value,client:form.querySelector('[name="client"]:checked')?.value||"",protocol:form.querySelector('[name="protocol"]:checked').value,outlook:form.querySelector('[name="outlook"]:checked').value};
  }
  function toast(message) {
    clearTimeout(toastTimer);
    $("#toast").textContent=message;
    $("#toast").hidden=false;
    toastTimer=setTimeout(()=>{$("#toast").hidden=true;},5000);
  }
  function applyConfig() {
    $$("[data-organization]").forEach(el=>el.textContent=config.organizationName||"Почта компании");
    $$("[data-email-example]").forEach(el=>el.textContent=config.emailExample||"name@company.ru");
    $$("[data-webmail]").forEach(el=>el.href=guides.safeUrl(config.webmailUrl,"https://mail.yandex.ru/"));
    $$("[data-app-password]").forEach(el=>el.href=guides.safeUrl(config.appPasswordUrl,"https://id.yandex.ru/security/app-passwords"));
    $("#support-label").textContent=config.supportLabel||"Свяжитесь с вашей ИТ-службой привычным способом.";
    const supportUrl=guides.safeUrl(config.supportUrl);
    if(supportUrl){$("#support-link").href=supportUrl;$("#support-link").hidden=false;}
    document.title=`Настройка почты · ${config.organizationName||"Помощь сотрудникам"}`;
  }
  function renderClients() {
    const state=selection();
    const mailIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg>';
    $("#client-options").innerHTML=guides.clients.map(client=>{
      const supported=client.os.includes(state.os);
      const availability=supported?"":`Доступно для ${client.os.map(os=>names[os]).join(", ")}`;
      return `<label class="client-choice" ${availability?`title="${esc(availability)}"`:""}><input type="radio" name="client" value="${client.id}" ${supported?"":"disabled"} ${supported&&client.id===state.client?"checked":""}><span><span class="client-monogram ${client.id}" aria-hidden="true">${client.mark==="mail"?mailIcon:client.mark}</span>${client.name}${availability?`<span class="sr-only">${availability}</span>`:""}</span></label>`;
    }).join("");
    $("#client-availability").textContent=state.os==="linux"?"Для Linux доступны Thunderbird и веб-почта.":state.os==="macos"?"Для macOS доступны Outlook, Thunderbird, Apple Mail и веб-почта.":"Для Windows доступны Outlook, Thunderbird, The Bat! и веб-почта.";
  }
  function updateSelection() {
    const state=selection();
    const isWeb=state.client==="web";
    $("#outlook-version").hidden=state.client!=="outlook"||state.os!=="windows";
    $("#protocol-fieldset").hidden=isWeb;
    $("#protocol-notice").outerHTML=`<div id="protocol-notice">${guides.safety(state)}</div>`;
    $("#protocol-detection").textContent=guides.detection(state);
    $("#show-guide").disabled=!state.client;
    $("#show-guide").innerHTML=(isWeb?"Как войти в почту":"Показать инструкцию")+' <span aria-hidden="true">→</span>';
    const client=guides.clients.find(item=>item.id===state.client);
    $("#selection-caption").textContent=client?`${names[state.os]} · ${client.name}`:"Инструкция под вашу программу";
    $(".section-mark").textContent=client?(isWeb?"02 / 02":"03 / 03"):"01 / 03";
    $("#selection-status").textContent=client?`Выбрано: ${names[state.os]}, ${client.name}. Инструкция готова к открытию.`:`Выбрано: ${names[state.os]}. Выберите программу.`;
    $("#guide").hidden=true;
    $("#guide-complete").hidden=true;
    $("#support-fallback").hidden=true;
    currentGuide=null;
  }
  function showGuide() {
    let result;
    try {result=guides.build(selection(),config);} catch(error){toast(error.message);return;}
    currentGuide=result;
    $("#guide-context").textContent=result.context;
    $("#guide-title").textContent=result.title;
    $("#guide-safety").innerHTML=result.safety;
    $("#client-source").href=result.source;
    $("#guide-steps").innerHTML=result.steps.map((step,index)=>`<details class="guide-step" data-step="${index}" ${index===0?"open":""}><summary><span class="step-number" aria-hidden="true">${index+1}</span><span>${step.title}</span><span class="step-chevron" aria-hidden="true">⌄</span></summary><div class="step-content">${step.html}<label class="step-done"><input type="checkbox" data-done="${index}"><span>${step.done}</span></label></div></details>`).join("");
    $("#guide-progress").max=result.steps.length;
    updateProgress();
    $("#guide").hidden=false;
    $("#guide").focus({preventScroll:true});
    $("#guide").scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});
  }
  function updateProgress() {
    if(!currentGuide)return;
    const done=$$("[data-done]:checked").length;
    $("#guide-progress").value=done;
    $("#progress-label").textContent=`Выполнено ${done} из ${currentGuide.steps.length}`;
    $("#guide-complete").hidden=done!==currentGuide.steps.length;
    $$(".guide-step").forEach((el,i)=>{
      const checked=el.querySelector("input").checked;
      el.classList.toggle("is-done",checked);
      el.querySelector(".step-number").textContent=checked?"✓":String(i+1);
    });
  }
  async function copy(text) {
    if(navigator.clipboard&&window.isSecureContext) {
      try {await navigator.clipboard.writeText(text);return true;} catch (_) { /* Fallback for file:// and restricted clipboard. */ }
    }
    const previous=document.activeElement;
    const field=document.createElement("textarea");
    field.value=text;
    field.setAttribute("readonly","");
    field.className="clipboard-field";
    document.body.append(field);
    field.select();
    let copied=false;
    try{copied=document.execCommand("copy");}catch(_){copied=false;}
    field.remove();
    previous?.focus({preventScroll:true});
    return copied;
  }
  function parametersText() {
    return `Яндекс 360 — параметры подключения\nЛогин: ваш полный рабочий адрес (пример: ${config.emailExample||"name@company.ru"})\nIMAP: imap.yandex.ru\nПорт: 993\nШифрование: SSL/TLS\nSMTP: smtp.yandex.ru\nПорт: 465\nШифрование: SSL/TLS\nАвторизация SMTP: включена, тот же рабочий адрес\nПароль: пароль приложения категории «Почта»\nОбычный новый пароль используется для входа в браузере.`;
  }
  function supportText() {
    const state=selection();
    const client=guides.clients.find(item=>item.id===state.client);
    const done=currentGuide?$$("[data-done]:checked").map(el=>Number(el.dataset.done)+1):[];
    return `Не удаётся настроить почту после перехода на Яндекс 360.\nОС: ${names[state.os]}\nПрограмма: ${client?.name||"не выбрана"}${state.client==="outlook"&&state.os==="windows"?` (${state.outlook==="new"?"новый":"классический"})`:""}\nСтарое подключение: ${state.client==="web"?"веб-почта, тип прежней программы не уточнялся":guides.protocolNames[state.protocol]}\nОтмечены шаги: ${done.join(", ")||"нет"}\n\nРабочий адрес: [добавьте свой адрес]\nВерсия почтовой программы: [укажите]\nВход в веб-почту: [работает / не работает]\nТекст ошибки: [вставьте]\nЧто уже пробовали: [опишите]\n\nПароли и коды подтверждения не прикладывайте.`;
  }
  form.addEventListener("change",event=>{
    if(event.target.name==="os")renderClients();
    updateSelection();
  });
  form.addEventListener("submit",event=>{event.preventDefault();showGuide();});
  $("#change-selection").addEventListener("click",()=>{
    $("#setup").scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
    form.querySelector('[name="os"]:checked').focus({preventScroll:true});
  });
  $("#guide-steps").addEventListener("change",event=>{
    if(!event.target.matches("[data-done]"))return;
    updateProgress();
    if(event.target.checked){
      const next=event.target.closest("details").nextElementSibling;
      if(next){next.open=true;next.querySelector("summary").focus({preventScroll:true});}
    }
  });
  $$("[data-copy]").forEach(button=>button.addEventListener("click",async()=>{
    toast(await copy(button.dataset.copy)?"Адрес сервера скопирован":"Не удалось скопировать. Выделите адрес сервера и скопируйте его вручную.");
  }));
  $("#copy-parameters").addEventListener("click",async()=>{
    toast(await copy(parametersText())?"Параметры скопированы. Замените пример логина на свой адрес.":"Буфер обмена недоступен. Скопируйте параметры из блока вручную.");
  });
  $("#copy-support").addEventListener("click",async()=>{
    const text=supportText();
    if(await copy(text)){toast("Описание скопировано. Добавьте ошибку и отправьте в ИТ-службу.");}
    else{const field=$("#support-fallback");field.value=text;field.hidden=false;field.focus();field.select();toast("Описание готово ниже. Выделите и скопируйте его вручную.");}
  });
  applyConfig();
  renderClients();
  updateSelection();
})();
