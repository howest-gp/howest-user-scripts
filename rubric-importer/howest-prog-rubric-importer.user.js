// ==UserScript==
// @name         Howest PROG Rubric Importer
// @version      1.0.0
// @description  A user script to import a rubric using raw JSON data
// @namespace    http://howest.be/
// @author       sigged
// @run-at       document-idle
// @include      https://*.instructure.com/courses/*/rubrics
// @include      https://*.instructure.com/accounts/*/rubrics
// @grant        none
// @icon         https://raw.githubusercontent.com/howest-gp/howest-user-scripts/master/howest-prog-64.png
// @downloadURL  https://raw.githubusercontent.com/howest-gp/howest-user-scripts/master/rubric-importer/howest-prog-rubric-importer.user.js
// @updateURL    https://raw.githubusercontent.com/howest-gp/howest-user-scripts/master/rubric-importer/howest-prog-rubric-importer.user.js
// ==/UserScript==

(function($) {
    'use strict';
    var assocRegex = new RegExp('^/(course|account)s/([0-9]+)/rubrics$');
    var errors = [];

    if (assocRegex.test(window.location.pathname)) {
        addImportButton();
    }

    function updateMessages(){
        var msg = document.getElementById('gprog_rubric_msg');
        if (!msg) {
            return;
        }
        if (msg.hasChildNodes()) {
            msg.removeChild(msg.childNodes[0]);
        }
        if (typeof errors === 'undefined' || errors.length === 0) {
            msg.style.display = 'none';
        } else {
            var ul = document.createElement('ul');
            var li;
            for (var i = 0; i < errors.length; i++) {
                li = document.createElement('li');
                li.textContent = errors[i];
                ul.appendChild(li);
            }
            msg.appendChild(ul);
            msg.style.display = 'inline-block';
        }
    }

    function addImportButton() {
        var parent = document.querySelector('aside#right-side');
        if (parent) {
            var el = parent.querySelector('#gprog_rubric');
            if (!el) {
                el = document.createElement('a');
                el.classList.add('btn', 'button-sidebar-wide');
                el.id = 'gprog_rubric';
                var icon = document.createElement('i');
                icon.classList.add('icon-import');
                el.appendChild(icon);
                var txt = document.createTextNode(' Rubriek importeren');
                el.appendChild(txt);
                el.addEventListener('click', showDialog);
                parent.appendChild(el);
            }
        }
    }

    function getCsrfToken() {
        var csrfRegex = new RegExp('^_csrf_token=(.*)$');
        var csrf;
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            var match = csrfRegex.exec(cookie);
            if (match) {
                csrf = decodeURIComponent(match[1]);
                break;
            }
        }
        return csrf;
    }

    function showDialog() {
        try {
            createDialog();
            $('#gprog_rubric_dialog').dialog({
                'title' : 'Rubriek importeren',
                'autoOpen' : false,
                'buttons' : [ {
                    'text' : 'Annuleren',
                    'click' : function() {
                        $(this).dialog('close');
                        var el = document.getElementById('gprog_rubric_text');
                        if (el) {
                            el.value = '';
                        }
                        errors = [];
                        updateMessages();
                    }
                }, {
                    'text' : 'Importeren',
                    'click' : processDialog,
                    'class' : 'Button Button--primary'
                }],
                'modal' : true,
                'height' : 'auto',
                'width' : '80%'
            });
            if (!$('#gprog_rubric_dialog').dialog('isOpen')) {
                $('#gprog_rubric_dialog').dialog('open');
                document.getElementById("gprog_rubric_text").focus();
            }
        } catch (e) {
            console.log(e);
        }
    }

    function createDialog() {
        var el = document.querySelector('#gprog_rubric_dialog');
        if (!el) {
            el = document.createElement('div');
            el.id = 'gprog_rubric_dialog';
            el.classList.add('ic-Form-control');

            var label = document.createElement('label');
            label.htmlFor = 'gprog_rubric_text';
            label.textContent = 'Rubric JSON data';
            label.classList.add('ic-Label');
            el.appendChild(label);
            var textarea = document.createElement('textarea');
            textarea.id = 'gprog_rubric_text';
            textarea.classList.add('ic-Input');
            textarea.style.height = "150px";
            textarea.placeholder = 'Paste rubric POST data here';
            el.appendChild(textarea);
            var msg = document.createElement('div');
            msg.id = 'gprog_rubric_msg';
            msg.classList.add('ic-flash-warning');
            msg.style.width = "100%";
            msg.style.maxWidth = "100%";
            msg.style.display = 'none';
            el.appendChild(msg);
            var parent = document.querySelector('body');
            parent.appendChild(el);
        }
    }

    function processDialog() {
        let json = "";

        let rubricJsonInput = document.getElementById('gprog_rubric_text');
        if (rubricJsonInput.value && rubricJsonInput.value.trim() !== "") {
            let formData = JSON.parse(rubricJsonInput.value);
            let association, assocMatch;

            assocMatch = assocRegex.exec(window.location.pathname);
            if (assocMatch) {
                var associationType = assocMatch[1].charAt(0).toUpperCase() + assocMatch[1].slice(1);
                association = {
                    'type' : associationType,
                    'id' : assocMatch[2],
                };
            } else {
                errors.push('Unable to determine where to place this rubric.');
                updateMessages();
            }

            //add association
            formData.rubric_association =
            {
                'id' : '',
                'use_for_grading' : 0,
                'hide_score_total' : 0,
                'association_type' : association.type,
                'association_id' : association.id,
                'purpose' : 'bookmark'
            };

            //add Csrf token
            formData.authenticity_token = getCsrfToken();

            console.log("Rubric Input", formData);

            var url = window.location.pathname;
               $.ajax({
                   'cache' : false,
                   'url' : url,
                   'type' : 'POST',
                   'data' : formData,
               }).done(function() {
                   //updateMsgs();
                   $('#gprog_rubric_dialog').dialog('close');
                   window.location.reload(true);
               }).fail(function() {
                   errors.push('All the information was supplied correctly, but there was an error saving rubric to Canvas.');
                   updateMessages();
               });

        } else {
            errors.push('Please paste your rubric JSON in the textbox.');
            updateMessages();
        }
    }
})($);