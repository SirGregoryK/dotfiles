var menu;
var lastCaretPosition = 0;
var vkTPLConfig = false;
var menuItemsLimit = 1;
var localStorageMessageKey = 'ex-message-tpls-v2';
var localStorageConfigKey = 'ex-message-config';
var editTimes = 1;
var importVersion = 1;
var dropDownHandlers = {};

//window.innerHeight 730 = 20
function trackWindowSize() {
    if (window.innerHeight >= 730) {
        menuItemsLimit = 20;
    } else {
        menuItemsLimit = Math.max( 1, (window.innerHeight - 40) / 35  );
    }
}

window.addEventListener('resize', function () {
    trackWindowSize();
});
trackWindowSize();

function getCaretPosition(editableDiv) {
    var caretPos = 0,
        sel, range;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.rangeCount) {
            range = sel.getRangeAt(0);
            if (range.commonAncestorContainer.parentNode == editableDiv || (range.commonAncestorContainer.parentNode && range.commonAncestorContainer.parentNode.parentNode == editableDiv)) {
                caretPos = {
                    node: range.commonAncestorContainer,
                    offset: range.endOffset
                }
            } else {
                caretPos = -1;
            }
        }
    }
    return caretPos;
}

function l(code) {
    var lang = {
        'tpls': 'Шаблоны',
        'w.title': 'Управление шаблонами',
        'w.add-tpl': 'Добавить шаблон',
        'w.create-tpl': 'Создать шаблон',
        'save': 'Сохранить',
        'alias': 'Название',
        'tpl': 'Шаблон',
        'delete': 'Удалить',
        'restore': 'Восстановить',
        'edit': 'Редактировать',
        'zero-tpl': 'Шаблон по умолчанию',
        'zero-tpl-help': 'Этот шаблон будет автоматически вставляться в поле набора сообщения. Например, приветствие или подпись. (обновите страницу после изменения шаблона)',
        'keys-help':'{user} – данный ключ заменится на имя пользователя.<br>{text} – этим ключом отметьте место в сообщении, куда будет поставлен курсор.',
        'help': 'Настройки',
        'h1': 'Расширение поможет Вам оказывать поддержку пользователей через сообщения ВКонтакте или упростит общение с друзьями.',
        'h2': 'Если у вас возникли проблемы при работе с расширением, напишите <a href="https://vk.com/id19039187">мне.</a>',
        'export': 'Экспорт/Импорт шаблонов',
        'export-btn': 'Экспортировать шаблоны',
        'export-info': 'Чтобы перенести все ваши шаблоны на другой компьютер – сохраните файл с шаблонами.',
        'about': 'О расширении',
        'export-file-name': 'template.json',
        'import': 'Импорт',
        'import-info': 'Загрузите файл с экспортированными шаблонами. Внимание: при импортировании Ваши шаблоны будут заменены шаблонами из файла.',
        'import-error-file-bad': 'Файл поврежден, импорт невозможен.',
        'import-error-file-is-new': 'Вы импортируете файл из новой версии расширения, обновите расширение и попробуйте снова. https://chrome.google.com/webstore/detail/%D1%88%D0%B0%D0%B1%D0%BB%D0%BE%D0%BD%D1%8B-%D1%81%D0%BE%D0%BE%D0%B1%D1%89%D0%B5%D0%BD%D0%B8%D0%B9-%D0%B2%D0%BA%D0%BE%D0%BD%D1%82%D0%B0%D0%BA/iipgkmkldmcgiifchkcjddodgmbdheak?authuser=2',
        'import-successful': 'Импорт успешно завершен. Перезагрузите страницу чтобы изменения вступили в силу',
        'import-btn': 'Выбрать файл',
        'text-tpl-text':'Привет, это тестовый шаблон!',
        'text-tpl-preview':'Шаблон',
        'tpls-found':'Найдены шаблоны',
        'user-kbd-or-click':'Используйте стрелки или кликните на шаблон',
        'enable-autocomplete':'Включить автодополнение',
        'all-changes-accepted-after-reload':'Изменения вступят в силу после перезагрузки страницы.',
        'settings':'Настройки',
        'enable-in-comments':'Включить шаблоны в комментариях',
        'w.info' : 'Обновление',
        'w.close' : 'Закрыть',
        'update-header' :'Обновления в версии 1.2.0',
        'update-1':'В новой версии появилась функция автодополнения. По мере того, как вы набираете слова в поле ввода сообщения, расширение ищет их среди шаблонов и предлагает найденные в выпадающем меню. Также Вы можете вызвать полный список шаблонов нажав пробел.',
        'update-2':'Кроме того, теперь шаблоны доступны и в комментариях к записям. К сожалению, автодополнение в комментариях реализовать не удалось. Список шаблонов можно вызвать нажав на иконку бургера под иконкой смайлика.',
        'update-3':'Обе функции опциональные и их можно отключить в <a href="#" onclick="openHelpBox(event)">Настройках расширения.</a>'
    };
    return lang[code];
}

function limitText(text, preview, forList) {
    var limit = 255;
    var limitShort = 30;
    if (forList) {
        var t;
        if (text.length > limit) {
            t = text.substr(0, limit) + '...';
        } else {
            t = text;
        }
        return t.replace(/\n/g, '<br>');
    } else {
        if (preview) {
            return preview;
        } else {
            if (text.length > limitShort) {
                return text.substr(0, limitShort) + '...';
            } else {
                return text;
            }
        }
    }
}

function getTpl(code) {
    var id = parseInt(code.replace('t', ''));
    var tpls = vkTPLConfig.tpls;
    if (tpls && tpls.length) {
        for (var i = 0; i < tpls.length; i++) {
            var tpl = tpls[i];
            if (tpl.id == id) {
                return tpl.text;
            }
        }
    }
    return '';
}

function getTplsForQuery(q) {
    var list = [];
    var tpls = vkTPLConfig.tpls;
    if (tpls && tpls.length && q) {
        q = q.trim();
        q = q.toLowerCase();
        for (var i = 0; i < tpls.length; i++) {
            var tpl = tpls[i];
            if (tpl.text.toLowerCase().indexOf(q) != -1 || (tpl.preview && tpl.preview.toLowerCase().indexOf(q) != -1)) {
                list.push( ['q'+tpl.id, limitText(tpl.text, tpl.preview, true), limitText(tpl.text, tpl.preview, false), '', '', 0] );
            }
        }
        if (list.length) {
            return list;
        }
    }
    return false;
}

function isGroopMessagePage() {
    var path = window.location.pathname;
    return path.indexOf('/gim') == 0 || path.indexOf('/im') == 0;
}

function removeEmojiBar() {
    var bar = document.querySelector('.im-chat-input--rcemoji.fl_r');
    if (bar) {
        bar.style.display = 'none';
    }
}
function buildItems() {
    var items = [
        ['edit', l('w.title'), function () {}]
    ];
    var tpls = vkTPLConfig.tpls;
    if (tpls && tpls.length) {
        for (var i = 0; i < tpls.length; i++) {
            var tpl = tpls[i];
            var id = 't' + tpl.id;
            var preview = limitText(tpl.text, tpl.preview, false);
            items.push([id, preview, function () {
            }]);
            if (i > menuItemsLimit) {
                break;
            }
        }
    }
    return items.reverse();
}

function createTplContent() {
    var c = '<div>';
    c += '<div class="subheader">' + l('alias') + '</div>';
    c += '<input maxlength="20" type="text" style="width: 100%;  box-sizing: border-box" class="text" id="ex-create-tpl-short">';
    c += '<div class="subheader">' + l('tpl') + '</div>';
    c += '<textarea class="text" style="width: 100%; box-sizing: border-box" rows="3" id="ex-create-tpl-text"></textarea>';
    c += '<p>'+l('keys-help')+'</p>';
    c += '</div>';
    return c;
}


function setTpl(data, id) {
    var tpls = vkTPLConfig.tpls;
    if (tpls) {
        if (id || id === 0) {
            for (var i = 0; i < tpls.length; i++) {
                if (tpls[i].id == id) {
                    tpls[i] = data;
                    vkTPLConfig.tpls = tpls;
                    return;
                }
            }
        } else {
            tpls.push(data);
        }
    }
    vkTPLConfig.tpls = tpls;
}

function saveNewTpl() {
    var text = document.querySelector('#ex-create-tpl-text').value;
    var short = document.querySelector('#ex-create-tpl-short').value;
    if (text) {
        if (createTplBox) {
            createTplBox.hide();
        }
        var tpl = {};
        if (tplId !== false) {
            tpl = getTplById(tplId);
        } else {
            tpl.id = getNextMaxId();
        }
        tpl.text = text;
        tpl.preview = short;
        setTpl(tpl, tplId);
        if (tplsListBox) {
            tplsListBox.content(getWindowContent());
            initSorter();
        }
        castToMenu();
    }
}

function getNextMaxId() {
    var id = -1;
    var tpls = vkTPLConfig.tpls;
    if (tpls) {
        for (var i = 0; i < tpls.length; i++) {
            id = Math.max(id, tpls[i].id);
        }
    }
    return (id + 1);
}

var createTplBox;
var tplId = false;
function addTpl(event) {
    if (event.preventDefault) {
        event.preventDefault();
    }
    var options = {
        'title': l('w.create-tpl'),
        'dark': 1,
        'width': 467
    };
    var box = new MessageBox(options, true);
    box.setButtons(l('save'), function () {
        saveNewTpl();
    });
    box.show();
    box.content(createTplContent());
    createTplBox = box;
    tplId = false;
}

function getTplById(id) {
    var tpls = vkTPLConfig.tpls;
    if (tpls) {
        for (var i = 0; i < tpls.length; i++) {
            if (tpls[i].id == id) {
                return tpls[i];
            }
        }
    }
    return false;
}

function editTpl(event, id) {
    addTpl(event);
    var tpl = getTplById(id);
    if (tpl) {
        document.querySelector('#ex-create-tpl-text').value = tpl.text || '';
        document.querySelector('#ex-create-tpl-short').value = tpl.preview || '';
        tplId = id;
    }
}

function removeTpl(id, node, event) {
    event.preventDefault();
    var tpl = getTplById(id);
    if (tpl) {
        if (tpl.delete) {
            node.innerHTML = "";
            node.classList.remove('group_l_restore');
            node.classList.add('group_l_delete');
            tpl.delete = false;
        } else {
            node.innerHTML = "&nbsp;&nbsp;"+l('restore');
            node.classList.add('group_l_restore');
            node.classList.remove('group_l_delete');

            tpl.delete = true;
        }
        setTpl(tpl, id);
    }
}

function getTplView(data, top) {
    var view = '<div class="group_l_row clear_fix js-tpl-item" data-id="' + data.id + '" id="public_contact_cell' + data.id + '" style="left: 20px; top: ' + (top) + 'px; width: 510px; position: absolute; cursor: move;">';
    view += '<a class="group_l_photo" href="#" style="width: 0px; margin-right: 0"></a>';
    view += '<div class="group_l_actions_wrap">'
    + '<a class="group_l_delete" onmouseover="showTooltip(this, {text: \''+l('delete')+'\', black: 1, shift: [12, 7, 7]})" onclick="removeTpl(' + data.id + ', this, event)"></a>&nbsp;<a class="group_l_edit" onmouseover="showTooltip(this, {text: \''+l('edit')+'\', black: 1, shift: [12, 7, 7]})" onclick="editTpl(event, ' + data.id + ')"></a>'
    + '</div>';
    view += '<div class="group_l_info">';
    if (data.preview) {
        view += '<div><a class="group_l_title" href="#" onclick="event.preventDefault(); return false;">' + data.preview + '</a></div>'
    }
    view += '<div class="group_l_position" style="max-height: 30px; overflow: hidden;">' + limitText(data.text, data.preview, true) + '</div>'
    + '</div>'
    + '</div>';
    return view;
}

function getWindowContent() {
    var count = 0;
    var height = 81;
    var content = '<div class="public_edit_box">';
    content += '<div id="public_tpls_list" class="group_l_rows" style="width: 100%; box-sizing: border-box;">';
    var tpls = vkTPLConfig.tpls;
    if (tpls && tpls.length) {
        for (var i = 0; i < tpls.length; i++) {
            content += getTplView(tpls[i], ( count++ * height ));
        }
    }
    content += '</div>';
    content += '</div>';
    return content;
}

function clearForDelete() {
    var newTpl = [];
    var tpls = vkTPLConfig.tpls;
    if (tpls) {
        for (var i = 0; i < tpls.length; i++) {
            if (!tpls[i].delete) {
                newTpl.push(tpls[i]);
            }
        }
    }
    tpls = newTpl;
    vkTPLConfig.tpls = tpls;
    castToMenu();
}

function saveZeroTpl() {
    var box = document.querySelector('#ex-zero-tpl-text');
    if (box) {
        vkTPLConfig.defaultTpl = box.value;
        saveTplsToStoreage();
    }
}

function exportTplsFile() {
    var data = createExport();
    var a = document.createElement("a");
    var file = new Blob([data], {type: 'application/json'});
    a.href = URL.createObjectURL(file);
    a.download = l('export-file-name');
    a.click();
}

function startImport(file) {
    var files = file.files; // FileList object

    // Loop through the FileList and render image files as thumbnails.
    for (var i = 0, f; f = files[i]; i++) {

        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function (theFile) {
            return function (e) {
                // Render thumbnail.
                try {
                    var data = JSON.parse(e.target.result);
                    if (data && data.v && data.v <= importVersion) {
                        tpls = [];
                        if (data.tpls) {
                            tpls = data.tpls;
                        }
                        if (data.zeroTpl) {
                            vkTPLConfig.defaultTpl = data.zeroTpl;
                        }
                        castToMenu();
                        vkTPLConfig.tpls = tpls;
                        alert(l('import-successful'));
                    } else {
                        alert(l('import-error-file-is-new'));
                    }
                } catch (e) {
                    alert(l('import-error-file-bad'));
                }
                //console.log(e.target.result);
            };
        })(f);

        // Read in the image file as a data URL.
        reader.readAsText(f);
    }
}

function exEnableAutocomplete(node,event) {
    vkTPLConfig.enableAutocomplete = isChecked(ge(node));
    saveTplsToStoreage();
}

function exEnableComments(node,event) {
    vkTPLConfig.enableInComments = isChecked(ge(node));
    saveTplsToStoreage();
}

function getWindowHelpContent() {
    if (vkTPLConfig.defaultTpl == 'false') {
        vkTPLConfig.defaultTpl = false;
    }
    var x = '';
    x += '<div style="margin-left: 0;margin-right: 0; padding-left: 0; border-top: 0; padding-top: 0; padding-bottom: 0" class="stats_head">' + l('settings') + '</div>';
    x += '<p>';
    if (vkTPLConfig.enableAutocomplete) {
        x += '<div id="ex_enable_autocomplete" class="checkbox on" onclick="checkbox(this); exEnableAutocomplete(this,event)"><div></div>'+l('enable-autocomplete')+'</div>';
    } else {
        x += '<div id="ex_enable_autocomplete" class="checkbox" onclick="checkbox(this); exEnableAutocomplete(this,event)"><div></div>'+l('enable-autocomplete')+'</div>';
    }
    x += '</p>';
    x += '<p>';
    x += '</p>';
    x += '<p>'+l('all-changes-accepted-after-reload')+'</p>';
    x += '<div style="margin-left: 0;margin-right: 0; padding-left: 0; padding-top: 13px; padding-bottom: 13px" class="stats_head">' + l('zero-tpl') + '</div>';
    x += '<textarea class="text" style="width: 100%; box-sizing: border-box" rows="3" id="ex-zero-tpl-text">' + (vkTPLConfig.defaultTpl ? vkTPLConfig.defaultTpl : '') + '</textarea>';
    x += '</div>';
    x += '<p>' + l('zero-tpl-help') + '</p>';
    x += '<p>'+l('keys-help')+'</p>';
    x += '<div style="margin-left: 0;margin-right: 0; padding-left: 0; padding-top: 13px; padding-bottom: 0;" class="stats_head">' + l('export') + '</div>';
    x += '<p>' + l('export-info') + '</p>';
    x += '<p style="text-align: center"><button onclick="exportTplsFile()" class="flat_button">' + l('export-btn') + '</button></p>';
    //x += '<div style="margin-left: 0;margin-right: 0;" class="stats_head">' + l('import') + '</div>';
    x += '<p>' + l('import-info') + '</p>';
    x += '<p style="text-align: center"><button onclick="this.nextSibling.click()" class="flat_button">' + l('import-btn') + '</button><input style="visibility: hidden; position: absolute" type="file" onchange="startImport(this)"></p>';
    x += '<div style="margin-left: 0;margin-right: 0; padding-left: 0; padding-top: 13px; padding-bottom: 0;" class="stats_head">' + l('about') + '</div>';
    x += '<p>' + l('h1') + '</p>';
    x += '<p>' + l('h2') + '</p>';
    return x;
}

function getInfoContent() {
    var x = '';
    x += '<div style="margin-left: 0;margin-right: 0; padding-left: 0; padding-top: 0; border-top: 0;" class="stats_head">' + l('update-header') + '</div>';
    x += '<p>';
    x += l('update-1');
    x += '</p>';
    x += '<p>';
    x += l('update-2');
    x += '</p>';
    x += '<p>';
    x += l('update-3');
    x += '</p>';
    return x;
}

function openHelpBox(event) {
    if (event.preventDefault) {
        event.preventDefault();
    }
    var options = {
        'title': l('help'),
        'dark': 1,
        'width': 467,
        'onHideAttempt': function () {
            saveZeroTpl();
            return true;
        }
    };
    var box = new MessageBox(options, true);
    box.content(getWindowHelpContent());
    box.setButtons(l('close'), function () {
        box.hide()
    });
    box.show();
}

var tplsListBox;
function onEditClick() {
    if (MessageBox) {
        __stm.add('sorter.js');
        var options = {
            'title': l('w.title'),
            'dark': 1,
            'width': 550,
            'onHideAttempt': function () {
                if (xSorter) {
                    xSorter.destroy();
                }
                clearForDelete();
                return true;
            }
        };
        var box = new MessageBox(options, true);
        show(boxLayerBG);
        box.setOptions({bodyStyle: "padding:0;"});
        box.setControlsText('<a href="" style="" id="ex-public_add_tpls" onclick="openHelpBox(event)">' + l('help') + '</a>');
        box.setButtons(l('w.add-tpl'), addTpl);
        box.content(getWindowContent());
        box.show();
        initSorter(true);
        tplsListBox = box;
    }
}

function castToMenu() {
    if (menu) {
        menu.setItems(buildItems());
        menu.reverse = false;
    }
    saveTplsToStoreage();
}

function afterSort() {
    console.log(arguments);
    var arItems = document.querySelectorAll('.js-tpl-item');
    var newTpls = [];
    for (var i = 0; i < arItems.length; i++) {
        var x = arItems[i];
        var id = x.getAttribute('data-id');
        var t = getTplById(id);
        if (t) {
            newTpls.push(t);
        }
    }
    vkTPLConfig.tpls = newTpls;
    castToMenu();
}

var xSorter;
function initSorter(fake) {
    if (typeof sorter != 'undefined' && !fake) {
        xSorter = sorter.init('public_tpls_list', {scrollNode: ge('public_tpls_list'), onReorder: afterSort, dh: 0});
    } else {
        setTimeout(function () {
            initSorter();
        }, 300);
    }
}

function getActiveArea() {
    var arAreas = document.querySelectorAll('.im-chat-input .im-chat-input--txt-wrap');
    var area = false;
    for (var i = 0; i < arAreas.length; i++) {
        if (arAreas[i].style.display != 'none') {
            area = arAreas[i];
            break;
        }
    }
    if (area) {
        area = area.querySelector('div.im_editable[contenteditable=true]');
        return area;
    }
    return false;
}

function hasTextNodes(node) {
    for (var i = 0; i < node.childNodes.length; i++) {
        var n = node.childNodes[i];
        if (n.nodeName == '#text') {
            return true;
        }
        if (n.hasChildNodes()) {
            return hasTextNodes(n);
        }
    }
    return false;
}

function getLastTextNode(node) {
    if (hasTextNodes(node)) {
        for (var i = node.childNodes.length - 1; i >= 0; i++) {
            var n = node.childNodes[i];
            if (n.nodeName == '#text') {
                return n;
            }
            if (n.hasChildNodes() && hasTextNodes(n)) {
                return getLastTextNode(n);
            }
        }
        return false;
    } else {
        while(node.firstChild) {
            node.removeChild(node.firstChild);
        }
    }
    return false;
}


function insertAfter(elem, refElem) {
    return refElem.parentNode.insertBefore(elem, refElem.nextSibling);
}

function createTplForNode(tpl) {
    if (tpl) {
        tpl = tpl.split("\n");
        var nodes = [];
        var focus = false;
        for (var i = 0; i < tpl.length; i++) {
            var n;
            var t = tpl[i];
            var isFocusNode = false, offset = 0;
            if (t.indexOf('{text}') != -1) {
                offset = t.indexOf('{text}');
                isFocusNode = true;
                t = t.replace(/\{text\}/g, '');
                t = t.replace(/  /g, " \u00a0");
            }
            if (i == 0 || i == tpl.length - 1) {
                n = document.createTextNode(t);
            } else {
                n = document.createElement('div');
                if (t.trim() == '') {
                    t = '<br>';
                }
                n.innerHTML = t;
            }
            if (isFocusNode) {
                focus = {'node': n, 'offset': offset};
            }
            nodes.push(n);
        }
        if (!focus) {
            var node = nodes[nodes.length - 1];
            var pos = ( node.textContent || node.innerText );
            if (pos) {
                pos = pos.length;
            } else {
                pos = 0;
            }
            focus = {
                'node': node,
                'offset': pos
            }
        }
        return {'nodes': nodes, 'focus': focus};
    }
}

function insertTpl(area,code) {
    if (area) {
        var tpl = getTpl(code.toString());
        tpl = makeUserTag(tpl, area);
        var startNode = false, insert = {};
        if (!lastCaretPosition || !lastCaretPosition.node) {
            var node = getLastTextNode(area);
            if (node) {
                startNode = node;
            } else {
                startNode = area;
            }
        } else {
            if (lastCaretPosition.node.nodeName != '#text') {
                if (hasTextNodes(lastCaretPosition.node)) {
                    startNode = getLastTextNode(lastCaretPosition.node);
                } else {
                    while(lastCaretPosition.node.firstChild) {
                        lastCaretPosition.node.removeChild( lastCaretPosition.node.firstChild )
                    }
                    startNode = lastCaretPosition.node;
                }
            } else {
                startNode = lastCaretPosition.node;
            }

        }
        insert = createTplForNode(tpl);
        //console.log(startNode);
        if (insert) {
            if (startNode == area) {
                for (var i = 0; i < insert.nodes.length; i++) {
                    if (i == 0) {
                        startNode.appendChild(insert.nodes[i]);
                    } else {
                        if (insert.nodes[i].nodeName == '#text') {
                            var d = document.createElement('div');
                            d.appendChild(insert.nodes[i]);
                            insert.nodes[i] = d;
                        }
                        startNode.appendChild(insert.nodes[i]);
                    }
                }
            } else {
                var lastNode;
                for (var j = 0; j < insert.nodes.length; j++) {
                    var currentNode = insert.nodes[j];
                    if (j == 0) {
                        if (startNode.nodeName != '#text') {
                            startNode.appendChild(currentNode);
                        } else {
                            var tmp = startNode.textContent;
                            var o = false;
                            if (lastCaretPosition && typeof lastCaretPosition.offset != 'undefined') {
                                o = lastCaretPosition.offset;
                                if (o == tmp.length) {
                                    o = false;
                                }
                            }
                            if (o !== false && o !== 0) {
                                o = parseInt(o);
                                var x1 = tmp.substr(0,o);
                                var x2 = tmp.substr(o);
                                if (!x1 || x1[x1.length - 1] != ' ' || x1[x1.length - 1] != ' ') {
                                    x1 += ' ';
                                    startNode.nodeValue = x1;
                                }
                                var x2node = document.createTextNode(x2);
                                insertAfter(x2node, startNode);
                                insertAfter(currentNode, startNode);
                            } else {
                                if (o === false) {
                                    if (!tmp || tmp[tmp.length - 1] != ' ') {
                                        tmp += ' ';
                                        startNode.nodeValue = tmp;
                                    }
                                    insertAfter(currentNode, startNode);
                                } else {
                                    startNode.parentNode.insertBefore( currentNode, startNode );
                                }
                            }
                        }
                        lastNode = currentNode;
                    } else if ( j != insert.nodes.length - 1 ) {
                        if (typeof lastNode != 'undefined') {
                            insertAfter(currentNode, lastNode);
                        }
                        lastNode = currentNode;
                    } else {
                        if (typeof lastNode != 'undefined') {
                            if (insert.nodes.length == 2) {
                                if (currentNode.nodeName == '#text') {
                                    var d = document.createElement('div');
                                    d.appendChild(currentNode);
                                    insertAfter(d, lastNode);
                                }
                            } else {
                                insertAfter(currentNode, lastNode);
                            }
                        }
                        if (currentNode.nextSibling) {
                            var endNode = currentNode.nextSibling;
                            if (endNode.nodeName == '#text') {
                                var str = endNode.textContent;
                                if (str[0] != ' ' && str[0] != ' ') {
                                    endNode.textContent = ' ' + str;
                                }
                            }
                        }
                    }
                    //startNode.appendChild(insert.nodes[j]);
                }
            }
            if (insert.focus.node) {
                setFocusToNode(insert.focus.node, insert.focus.offset);
            }
            var evt = document.createEvent("KeyboardEvent");
            evt.initEvent("keyup", true, true, window,
                0, 0, 0, 0,
                37, 37);
            area.dispatchEvent(evt);
            var evt2 = document.createEvent("KeyboardEvent");
            evt2.initEvent("keyup", true, true, window,
                0, 0, 0, 0,
                39, 39);
            area.dispatchEvent(evt2);
        }
    }
}

function onInfoClick() {
    vkTPLConfig.showInfo = 1;
    saveTplsToStoreage();
    if (MessageBox) {
        __stm.add('sorter.js');
        var options = {
            'title': l('w.info'),
            'dark': 1,
            'width': 467
        };
        var box = new MessageBox(options, true);
        show(boxLayerBG);
        box.setButtons(l('w.close'), function () { box.hide() });
        box.content(getInfoContent());
        box.show();
    }
}

function appendMenuTo(href, input) {
    var items = buildItems();
// <div class="tt_w tt_default tt_down" style="position: absolute; opacity: 1; top: -124px; left: 64px; display: none; pointer-events: auto;">
// <div class="wrapped">
// <div class="im-settings _im_settings_menu _im_settings_popup">
//         <a class="ui_actions_menu_item _im_settings_action" data-action="spam">Спам</a>
//         <a class="ui_actions_menu_item _im_settings_action" data-action="sound">Отключить звуковые уведомления</a>
//     <a class="ui_actions_menu_item _im_settings_action" data-action="browser">Включить оповещения в браузере</a>
//     <a class="ui_actions_menu_item" href="/al_im.php?act=a_switch_interface&amp;hash=ef709a15da9853d840&amp;type=classic">Перейти в классический интерфейс</a>
//     </div></div></div>
    var box = document.createElement('div');
    box.classList.add('tt_w');
    box.classList.add('tt_default');
    box.classList.add('tt_down');
    box.style.position = 'absolute';
    box.style.opacity = 'absolute';
    box.style.top = '-124px';
    box.style.left = '0px';
    box.style.display = 'none';
    var wrapped = document.createElement('div');
    wrapped.classList.add('wrapped');
    var list = document.createElement('div');
    list.classList.add('im-settings');
    list.classList.add('_im_settings_menu');
    list.classList.add('_im_settings_popup');

    var onItemClick = function (code) {
        box.style.display = 'none';
        if (code == 'edit') {
            return onEditClick();
        }
        if (code == 'info') {
            return onInfoClick();
        }
        var area;
        if (!input) {
            area = getActiveArea();
        } else {
            area = input;
        }
        insertTpl(area, code);
    };

    menu = {
        setItems: function (items) {
            list.innerHTML = '';
            items.forEach( function (item) {
                var node = document.createElement('a');
                node.classList.add('ui_actions_menu_item');
                node.classList.add('_im_settings_action');
                node.onclick = function () {
                    onItemClick(item[0])
                };
                node.innerText = item[1];
                list.appendChild(node)
            });
        }
    };

    menu.setItems(items);
    wrapped.appendChild(list);
    box.appendChild(wrapped);
    var oldBox = href.querySelector('.tt_w');
    if (oldBox) {
        href.removeChild(oldBox);
    }
    href.appendChild(box);
    href.onmouseover = function () {
        box.style.opacity = 1;
        box.style.display = '';
        box.style.top = ( (wrapped.clientHeight+5) * -1) + 'px';
        clearTimeout(box.ttt);
    };
    href.onmouseout = function () {
        clearTimeout(box.ttt);
        box.ttt = setTimeout( function () {
            box.style.display = 'none';
        }, 200 )
    }
}

function fakeDropDown(elementId) {
    if (!vkTPLConfig.enableAutocomplete) {
        return;
    }
    let node = document.getElementById(elementId)
    node.addEventListener('keyup', (e) => {
        let text = node.innerText
        updateFastTemplates(text, elementId)
    })
}

let latstupdateFastTemplates = "-1"
let updateFastTemplatesTimer = null
function updateFastTemplates(text, elementId, update) {
    if (!update) {
        clearTimeout(updateFastTemplatesTimer)
        updateFastTemplatesTimer = setTimeout(() => { updateFastTemplates(text, elementId, true) }, 300)
        return
    }
    if (text != latstupdateFastTemplates) {
        latstupdateFastTemplates = text
        let tpls = []
        vkTPLConfig['tpls'].every( t => {
            if (t.preview && t.preview.toLowerCase().indexOf(text.toLowerCase()) != -1) {
                tpls.push(t)
            }
            return tpls.length < 5
        } )
        if (tpls.length == 0) {
            vkTPLConfig['tpls'].every( t => {
                tpls.push(t)
                return tpls.length < 5
            } )
        }
        insertFastTpls(tpls, elementId)
    }
}

function insertFastTpls(tpls, elementId) {
    let node = document.getElementById('im_add_hs_fast_tpls')
    if (node) {
        node.innerHTML = ''
        tpls.forEach( tpl => {
            let box = document.createElement('span')
                box.style.padding = '5px 5px 5px 5px';
                box.style.whiteSpace = 'nowrap';
                box.style.maxWidth = '120px';
                box.style.overflow = 'hidden';
                box.style.textOverflow = 'ellipsis';
                box.style.display = 'inline-block';
                box.style.cursor = 'pointer';
                box.style.marginBottom = '-8px';
            box.onclick = () => {
                let area = document.getElementById(elementId)
                area.innerHTML = '';
                lastCaretPosition = getCaretPosition(area);
                insertTpl(area, tpl.id);
            }
            box.innerHTML = (tpl.preview || tpl.text || "").substr(0, 100)
            node.appendChild(box)
        } )
    }
}

function insertBtn() {
    var box = document.querySelector('.im-chat-input--textarea');
    var btn = document.querySelector('#im_add_tpl');
    if (box && !btn) {
        btn = document.createElement('div');
        btn.classList.add('_im_media_selector2');
        btn.classList.add('im-chat-input--selector');
        btn.id = 'im_add_tpl';
        btn.style.paddingLeft = "16px";
        btn.style.position = 'relative';
        btn.style.paddingTop = "8px";
        btn.style.color = "#2a5885";
        btn.style.cursor = "pointer";
        btn.style.maxWidth = '78px';
        btn.style.zIndex = '120';
        btn.style.paddingBottom = '10px';
        btn.style.marginBottom = '-10px';
        btn.style.display = 'inline-block';
        btn.innerHTML = '<span class="ms_item_more_label">' + l('tpls') + '</span>';
        appendMenuTo(btn);
        box.appendChild(btn);

        let fastTpls = document.createElement('div');
        fastTpls.classList.add('_im_media_selector2');
        fastTpls.classList.add('im-chat-input--selector');
        fastTpls.id = 'im_add_hs_fast_tpls';
        fastTpls.style.paddingLeft = "10px";
        fastTpls.style.display = 'inline-block';
        fastTpls.style.position = 'relative';
        fastTpls.style.color = "#2a5885";
        fastTpls.style.marginBottom = '-3px';
        fastTpls.style.overflow = 'hidden';
        fastTpls.style.maxWidth = '380px';
        fastTpls.style.whiteSpace = 'nowrap';
        fastTpls.innerHTML = '';
        box.appendChild(fastTpls);
    }

    var arAreas = document.querySelectorAll('.im_editable.im-chat-input--text._im_text[contenteditable=true]');
    for (var i = 0; i < arAreas.length; i++) {
        var a = arAreas[i];
        var zeroTpl = vkTPLConfig.defaultTpl;
        if (zeroTpl && zeroTpl.toString().length && zeroTpl.toString() != 'false') {
            if (a.innerText.trim() == '') {
                var n = insertTextToNode(a, zeroTpl, 'zero');
                if (a.parentNode.style.display != 'none') {
                    setFocusToNode(n);
                }
            }
        }
        if (a.parentNode.style.display != 'none') {
            if (!a.ddInit) {
                fakeDropDown(a.id);
                a.ddInit = true;
                updateFastTemplates("", a.id, true)
            }
        }
    }

}

function setFocusToNode(node, offset) {
    var l = node.textContent || node.innerHTML;
    if (l) {
        if (l != '<br>') {
            l = l.length;
        } else {
            l = 0;
        }
    } else {
        l = 0;
    }
    if (typeof offset != 'undefined') {
        l = offset;
    }
    var _range = document.createRange();
    var _sel = window.getSelection();
    if (_sel.focusNode) {
        try {
            _range.setStart(node, l);
        } catch (e) {
        }
    }
    _range.collapse(true);
    _sel.removeAllRanges();
    _sel.addRange(_range);
    while ( ( !node.classList || !node.classList.contains('im_editable') ) && node.parentNode) {
        node = node.parentNode;
    }
    if (node.focus) {
        node.focus();
    }
}

function makeUserTag(text, node) {
    var n = document.querySelector('.im-page--title-main-inner._im_page_peer_name');
    var user = "";
    if (n) {
        user = n.innerHTML.toString().split(" ").shift();
    }
    text = text.replace(/\{user\}/g, user);
    return text;
}

function insertTextToNode(node, text, strategy) {
    var returnNode = node;
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
    text = makeUserTag(text, node);
    if (text.indexOf("\n") != -1) {
        var arLines = text.split("\n");
        var div;
        for (var i = 0; i < arLines.length; i++) {
            div = document.createElement('div');
            var line = arLines[i];
            if (strategy == 'zero') {
                if (line.indexOf('{text}') != -1) {
                    line = line.replace('{text}', '');
                    returnNode = div;
                }
            } else {
                returnNode = div;
            }
            div.innerHTML = line;
            if (line == '') {
                div.innerHTML = '<br>';
            }
            node.appendChild(div);
        }
    } else {
        node.innerHTML = text;
        returnNode = node;
    }
    return returnNode
}

function trackAndPast(lockCircle) {
    if (isLoadConfig()) {
        if (isGroopMessagePage()) {
            removeEmojiBar();
            insertBtn();
        } else {
            dropDownHandlers = {};
        }
    } else {
        if (!lockCircle) {
            loadTpls();
        }
    }
}

function isLoadConfig() {
    return vkTPLConfig != false;
}

trackAndPast();

function afterLoadTpls() {
    trackAndPast(true);
}

function checkTpls(data) {
    return data;
}

function getDefaultTPLConfig() {
    return {'tpls':[],'defaultTpl':false,v:1,tmp:1};
}

function loadTpls() {
    var tpls = false;
    var zeroTpl = false;

    var data = localStorage.getItem(localStorageMessageKey);
    if (data) {
        try {
            data = JSON.parse(data);
            tpls = checkTpls(data);
        } catch (e) {

        }
    } else {
        data = localStorage.getItem('ex-message-tpls');
        if (data) {
            try {
                data = JSON.parse(data);
                tpls = checkTpls(data);
                saveTplsToStoreage('skipZero');
                localStorage.removeItem('ex-message-tpls');
            } catch (e) {

            }
        }
    }
    data = localStorage.getItem(localStorageMessageKey + 'z');
    if (data) {
        zeroTpl = data;
    } else {
        data = localStorage.getItem('ex-message-tpls' + 'z');
        if (data) {
            zeroTpl = data;
            saveTplsToStoreage('skipTpls');
            localStorage.removeItem('ex-message-tpls' + 'z');
        }
    }
    localStorage.setItem(localStorageMessageKey + 'et', editTimes++);

    data = localStorage.getItem(localStorageConfigKey);
    if (data) {
        try {
            vkTPLConfig = JSON.parse(data);
            if (!vkTPLConfig.v) {
                vkTPLConfig = getDefaultTPLConfig();
            }
        } catch (e) {
            vkTPLConfig = getDefaultTPLConfig();
        }
    }

    if (tpls) {
        vkTPLConfig['tpls'] = tpls;
        localStorage.removeItem(localStorageMessageKey);
        localStorage.removeItem('ex-message-tpls');
        saveTplsToStoreage();
    }

    if (zeroTpl == 'false') {
        zeroTpl = false;
    }
    if (zeroTpl) {
        vkTPLConfig['defaultTpl'] = zeroTpl;
        localStorage.removeItem(localStorageMessageKey + 'z');
        localStorage.removeItem('ex-message-tpls' + 'z');
        saveTplsToStoreage();
    }
    if (!vkTPLConfig.tpls && !vkTPLConfig.tpls.length) {
        vkTPLConfig.tpls = [
            {
                id:1,
                text:l('text-tpl-text'),
                preview:l('text-tpl-preview')
            }
        ];
    }
    if (typeof vkTPLConfig.enableAutocomplete == 'undefined') {
        vkTPLConfig.enableAutocomplete = true;
    }
    if (typeof vkTPLConfig.enableInComments == 'undefined') {
        vkTPLConfig.enableInComments = true;
    }
    afterLoadTpls();
}

function incrementTPLSWriter() {
    if (!vkTPLConfig.tmp) {
        vkTPLConfig.tmp = 0;
    } else {
        vkTPLConfig.tmp++;
    }
}

function saveTplsToStoreage() {
    localStorage.setItem(localStorageConfigKey, JSON.stringify(vkTPLConfig));
    incrementTPLSWriter();
}

if (__stm && __stm.add) {
    __stm.add('groups.css');
    __stm.add('groups_edit.css');
    __stm.add('stats.css');
    __stm.add('ui_common.css');
    __stm.add('tooltips.css');
}

var gCurrentLocation = window.location.search;
setInterval(function () {
    if (gCurrentLocation != window.location.search) {
        gCurrentLocation = window.location.search;
        trackAndPast();
    }
}, 500);


function insertTplsMenu(options) {
    if (options && vkTPLConfig.enableInComments && false) {
        if (!options.skipTpls) {
            var input = options.input;
            if (input && input.nodeName == 'DIV') {
                var parent = input.parentNode;
                var emojiSmail = parent.querySelector('.emoji_smile');
                var btn = getMenuTplBtn(emojiSmail);
                btn.innerHTML = l('tpls');
                parent.appendChild(btn);
                btn.id = input.id + '_tpls';
                input.style.minHeight = '39px';
                appendMenuTo(btn, input);
            }
        }
    }
}

function getMenuTplBtn(emoji) {
    var div = document.createElement('div');
    div.setAttribute('style', 'position:absolute;bottom:35px;right:3px;width:20px;height:20px;');
    if (emoji) {
        var top = emoji.clientHeight + emoji.offsetTop;
        div.setAttribute('style', 'position:absolute;top:'+top+'px;right:3px;width:20px;height:20px;');
        if (emoji.parentNode && emoji.parentNode.classList.contains('reply_field_wrap')) {
            div.style.right = '5px';
        }
    }
    div.style.overflow = 'hidden';
    div.style.color = 'rgba(0,0,0,0)';
    div.style.opacity = '0.8';
    div.style.backgroundImage = 'url('+getMenuImageHref()+')';
    div.style.backgroundRepeat = 'no-repeat';
    div.style.backgroundPosition = 'center';
    div.style.backgroundSize = '80%';
    return div;
}

function createExport() {
    var exportData = {};
    var tpls = vkTPLConfig.tpls;
    if (tpls && tpls.length) {
        exportData.tpls = tpls;
    }
    if (vkTPLConfig.defaultTpl) {
        exportData.zeroTpl = vkTPLConfig.defaultTpl;
    }
    exportData.v = importVersion;
    return JSON.stringify(exportData);
}
function dropDown(elementId) {
    if (!vkTPLConfig.enableAutocomplete) {
        return;
    }
    dropDownHandlers[elementId] = initDropDownF(elementId);
    function initDropDown(el, options) {
        if (!(el = ge(el))) {
            return null;
        }

        var composer = data(el, 'composer');
        if (composer) {
            return composer;
        }
        composer = {
            input: el,
            inited: false,
            options: options
        };

        data(el, 'composer', composer);

        el.parentNode.insertBefore(
            composer.wddWrap = ce('div', {
                className: 'composer_wdd clear_fix ' + (options.wddClass || ''),
                id: el.id + '_composer_wdd',
                innerHTML: '<input type="hidden" id="' + el.id + '_composer_wdd_term"/>'
            }, {
                width: options.width || getSize(el)[0]
            }),
            el.nextSibling
        );

        catchWideDropdown();
        composer.wddInput = composer.wddWrap.firstChild;
        composer.wdd = WideDropdown.initSelectOriginal(composer.wddWrap, extend({
            text: composer.wddInput,
            input: el,
            skipTpls:true,
            toup:true,
            wholeIndex:9999,
            url:'1',
            requestWait:60*60*1000,
            noResult: options.lang.noResult || '',
            introText: options.lang.introText || '',
            onItemSelect: function(x) {
                var id = x[0];
                if (id != "skip") {
                    id = id.replace('q', '');
                    dropDownHandlers[elementId].input.innerHTML = '';
                    lastCaretPosition = getCaretPosition(dropDownHandlers[elementId].input);
                    insertTpl(dropDownHandlers[elementId].input, id);
                    Composer.hideSelectList(dropDownHandlers[elementId]);
                } else {
                    if (window.event) {
                        if (window.event instanceof KeyboardEvent) {
                            dropDownHandlers[elementId].input.innerHTML += '<div><br></div>';
                            var node = dropDownHandlers[elementId].input.childNodes[ dropDownHandlers[elementId].input.childNodes.length - 1 ];
                            if (node) {
                                setFocusToNode(node, 0);
                            }

                        }
                    }
                    Composer.hideSelectList(dropDownHandlers[elementId]);
                }
                return false;
            },
            custom:function (q) {
                if (q) {
                    if (q === "false") {
                        dropDownHandlers[elementId].wdd.cache[''] = false;
                    }
                    var list = getTplsForQuery(dropDownHandlers[elementId].input.innerText);
                    if (list && list.length) {
                        list.unshift(['skip', l('tpls-found'), l('user-kbd-or-click'), '', '', '', 0]);
                        //dropDownHandlers[elementId].wdd.text = {focused:true};
                    } else {
                        dropDownHandlers[elementId].wdd.text.value = "";
                    }
                    return list
                } else {
                    return false;
                }
            }
        }, options.wddOpts || {}));

        el.dd = composer.wddWrap.id;

        if (!Composer.onKeyEventOriginal) {
            Composer.onKeyEventOriginal = Composer.onKeyEvent;
            Composer.onKeyEvent = function (composer, event) {
                if (composer && composer.options && composer.options.onBeforeKeyEvent) {
                    composer.options.onBeforeKeyEvent.apply(this, arguments);
                }
                Composer.onKeyEventOriginal.apply(this, arguments);
                if (composer && composer.options && composer.options.onAfterKeyEvent) {
                    composer.options.onAfterKeyEvent.apply(this, arguments);
                }
            };
        }

        if (!Composer.hideSelectListOriginal) {
            Composer.hideSelectListOriginal = Composer.hideSelectList;
            Composer.hideSelectList = function (composer) {
                if (composer && composer.options && composer.options.onBeforeClose) {
                    composer.options.onBeforeClose.apply(this, arguments);
                }
                Composer.hideSelectListOriginal.apply(this, arguments);
            };
        }
        Composer.initEvents(composer);

        if (options.media) {
            composer.addMedia = initAddMedia(options.media.lnk, options.media.preview, options.media.types, options.media.options);
        }

        setStyle(composer.wddWrap, 'width', '');

        composer.inited = true;

        return composer;
    }

    function initDropDownF(id) {
        var options = {
            lang:{
                introText:false,
                noResult: false
            },
            onValueChange: function (value) {
                if (value) {
                    dropDownHandlers[elementId].curTerm = value;
                    Composer.toggleSelectList(dropDownHandlers[elementId]);
                }
            },
            onBeforeKeyEvent : function (composer,event) {
                if (composer && composer.input) {
                    composer.input.disabled = false;
                }
            },
            onAfterKeyEvent : function (composer,event) {
                if (composer && composer.wdd && composer.wdd.over && composer.wdd.over != 'skip' && composer.input) {
                    composer.input.disabled = true;
                }
            },
            onBeforeClose:function (composer) {
                if (composer && composer.input) {
                    composer.input.disabled = false;
                }
            }
        };
        if (!data(ge(id), 'composer')) {
            if (!cur.composerAdded) {
                stManager.add(['wide_dd.css', 'wide_dd.js'], function () {
                    cur.composerAdded = true;
                    dropDownHandlers[elementId] = initDropDown(id, options);
                });
                return dropDownHandlers[elementId];
            } else {
                return initDropDown(id, options)
            }
        } else {
            return data(ge(id), 'composer');
        }
    }
}

function catchWideDropdown() {
    if (!WideDropdown.initSelectOriginal) {
        WideDropdown.initSelectOriginal = WideDropdown.initSelect;
        WideDropdown.initSelect = function (node, params) {
            insertTplsMenu(params);
            return WideDropdown.initSelectOriginal.apply(this, arguments);
        };
    }
}
function catchWideDropdownLoader() {
    if (!cur.composerAdded) {
        stManager.add(['wide_dd.css', 'wide_dd.js'], function () {
            catchWideDropdown();
        });
    } else {
        catchWideDropdown();
    }
}
catchWideDropdownLoader();


function getMenuImageHref() {
    var script = document.querySelector('script#ex-vk-tpls');
    if (script) {
        return script.getAttribute('data-menu');
    }
    return '';
}

function getNotifyImageHref() {
    var script = document.querySelector('script#ex-vk-tpls');
    if (script) {
        return script.getAttribute('data-notify');
    }
    return '';
}