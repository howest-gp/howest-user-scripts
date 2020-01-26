// ==UserScript==
// @name         Howest PROG Classroom Conventions
// @version      1.0.1
// @description  A user script to validate Howest PROG conventions in GitHub Classrooms
// @namespace    http://howest.be/
// @author       sigged
// @run-at       document-idle
// @match        https://classroom.github.com/classrooms/*
// @grant        none
// @icon         https://raw.githubusercontent.com/howest-gp/howest-user-scripts/master/howest-prog-64.png
// @downloadURL  https://raw.githubusercontent.com/howest-gp/howest-user-scripts/master/classroom-conventions/howest-prog-classroom-conventions.user.js
// @updateURL    https://raw.githubusercontent.com/howest-gp/howest-user-scripts/master/classroom-conventions/howest-prog-classroom-conventions.user.js
// ==/UserScript==

(function() {
    'use strict';

    let lastHref = "";

    const pages = [
        {
            name: 'Assignment',
            matchUrls: [
                /^http(s?):\/\/classroom.github.com\/classrooms\/[^\s\/]+\/(group-)?assignments/g
            ],
            initialize: initAssignmentPageValidation
        }
    ];

    const rules = {
        assignment: {
            pattern: /^(st-)(\d{4}-\d-)?(\w+-)?(\w+)?/g
        },
        classroom: {
            pattern: /^(st-)(\d{4}-\d-)?(\w+-)?(\w+)?/g
        }
    };

    function determinePage()
    {
        let currentPage = null;
        for(let page in pages)
        {
            if(currentPage) break;
            for(let matchUrl in pages[page].matchUrls)
            {
                if(window.location.href.match(pages[page].matchUrls[matchUrl]))
                {
                    currentPage = pages[page];
                    break;
                }
            }
        }
        return currentPage;
    }

    function init() {
        let isBusy = false;
        window.setInterval(() => {
            try{
                if(isBusy) return;
                if(window.location.href != lastHref)
                {
                    let currentPage = determinePage();
                    if(currentPage)
                    {
                        console.log(`init page "${currentPage.name}"`, window.location.href);
                        currentPage.initialize();
                    }
                    lastHref = window.location.href;
                }
            }
            finally
            {
                isBusy = false;
            }
        }, 500);
    }

    function validateAssignmentPrefix(assignmentPrefix){
        let error = null;
        const result = rules.assignment.pattern.exec(assignmentPrefix);
        rules.assignment.pattern.lastIndex = 0;

        if(result && result["1"]){
            if(!result["2"])
            {
                error = `Academiejaar en jaarhelft ontbreken. vb: <code style="font-size:1.1em;">st-<b><u>1920-1-</u></b>S1G1-pe01</code>`;
            }
            else if(!result["3"])
            {
                error = `Klasgroep ontbreekt. vb: <code style="font-size:1.1em;">st-${result["2"]}<b><u>S1G1</u></b>-pe01</code>`;
            }
            else if(!result["4"])
            {
                error = `Opdracht ID ontbreekt. vb: <code style="font-size:1.1em;">st-${result["2"]}${result["3"]}<b><u>pe01</u></b></code>`;
            }
            else if(assignmentPrefix.endsWith("-"))
            {
                error = `De prefix hoeft niet te eindigen met een <code style="font-size:1.1em;"><b>-</b></code>`;
            }
        }else{
            error = `Prefix voor studentenrepositories moeten starten met <code style="font-size:1.1em;"><b><u>st-</u></b></code>`;
        }

        return error;
    }

    function initAssignmentPageValidation(){
        try
        {
            let assignment_slug_tm_validation = document.querySelector("div#assignment_slug_tm_validation");
            const assignment_title = document.querySelector("input#assignment_title") || document.querySelector("input#group_assignment_title");
            const assignment_slug = document.querySelector("input#assignment_slug") || document.querySelector("input#group_assignment_slug");

            if(!(assignment_title && assignment_slug)) return;

            const assignment_submit = assignment_slug.form.querySelector("input[type=submit]");

            //clear buggy event handlers in assignment title
            const assignment_title_new = assignment_title.cloneNode(true);
            //assignment_title_new.removeAttribute("oninput");
            assignment_title.parentNode.replaceChild(assignment_title_new, assignment_title);

            validation(assignment_slug.value);

            assignment_slug.addEventListener('change', event => {
                validation(assignment_slug.value);
            });
            assignment_slug.addEventListener('input', event => {
                validation(assignment_slug.value);
            });

            function validation(assignmentPrefix)
            {
                const error = validateAssignmentPrefix(assignmentPrefix);
                renderError(error, assignment_slug, assignment_submit);
            }
        }
        catch(e)
        {
            console.error(e);
        }
    }

    function renderError(errorMessage, errorElement, elementToDisable)
    {
        const validationMessageElementId = "howest-prog-convention-element-validdation-message";
        const validationMessageElementStyle = "padding:5px;color:#f00;";
        let validationMessageElement = document.querySelector(`div#${validationMessageElementId}`);

        if(errorMessage)
        {
            errorElement.style="border-color:#f00;color:#f00;";
            if(elementToDisable){
                elementToDisable.setAttribute("disabled","disabled");
            }
            if(!validationMessageElement){
                validationMessageElement = document.createElement("div");
                validationMessageElement.id = validationMessageElementId;
                validationMessageElement.setAttribute("style", validationMessageElementStyle);
                errorElement.parentNode.appendChild(validationMessageElement);
            }
            validationMessageElement.innerHTML = "&#9888;&nbsp;" + errorMessage;
        }
        else
        {
            errorElement.style="border-color:#007b00;color:#007b00;";
            if(elementToDisable){
                elementToDisable.removeAttribute("disabled");
            }
            if(validationMessageElement) {
                validationMessageElement.parentNode.removeChild(validationMessageElement);
            }
        }
    }

    init();
})();