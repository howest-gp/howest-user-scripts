// ==UserScript==
// @name         Howest PROG Classroom Conventions
// @version      1.1.0
// @description  A user script to validate Howest PROG conventions in GitHub Classrooms
// @namespace    http://howest.be/
// @author       sigged
// @run-at       document-idle
// @match        https://classroom.github.com/*
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
                /^http(s?):\/\/classroom.github.com\/classrooms\/[^\s\/]+\/new_assignments/g
            ],
            initialize: initAssignmentPageValidation
        },
        {
            name: 'Classroom',
            matchUrls: [
                /^http(s?):\/\/classroom.github.com\/classrooms\/[^\s\/]+((\/setup(_organization)?$|\/settings$)|$)/g
            ],
            initialize: initClassroomPageValidation
        }
    ];

    const rules = {
        assignment: {
            pattern: /^(st-)(\d{4}-\d-)?(\w+-)?(\w+)?/g
        },
        classroom: {
            pattern: /^(\d{4}-\d-)([^\s\/-]+-)?([^\s\/-]+)?/g
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
                    //console.log(`determining new page`, window.location.href);
                    let currentPage = determinePage();
                    if(currentPage)
                    {
                        console.log(`init page "${currentPage.name}"`, window.location.href);
                        currentPage.initialize();
                    }
                    lastHref = window.location.href;
                    ensureSlugFieldVisible();
                }
            }
            finally
            {
                isBusy = false;
            }
        }, 500);
    }


    function initClassroomPageValidation(){
        try
        {
            const classroom_title = document.querySelector("input[type=text]#organization_title");
            if(!(classroom_title)) return;
            const classroom_submit = classroom_title.form.querySelector("input[type=submit]");

            classroom_title.setAttribute("autocomplete","off");
            classroom_title.style.maxHeight = "28px";
            if(classroom_submit) classroom_submit.style.maxHeight = "28px";

            validation(classroom_title.value);
            classroom_title.addEventListener('change', event => {
                validation(classroom_title.value);
            });
            classroom_title.addEventListener('input', event => {
                validation(classroom_title.value);
            });

            function validation(classroomName)
            {
                const error = validateClassroomName(classroomName);
                renderError(error, classroom_title, classroom_submit);
            }
        }
        catch(e)
        {
            console.error(e);
        }
    }

    function validateClassroomName(classroomName){
        let error = null;
        const result = rules.classroom.pattern.exec(classroomName);
        rules.classroom.pattern.lastIndex = 0;

        if(result && result["1"]){
            if(!result["2"])
            {
                error = `Klasgroep ontbreekt. vb: <code style="font-size:1.1em;">${result["1"]}<b><u>S1G1</u></b>-prb</code>`;
            }
            else if(!result["3"])
            {
                error = `Modulecode ontbreekt. vb: <code style="font-size:1.1em;">${result["1"]}${result["2"]}<b><u>prb</u></b></code>`;
            }
            else if(classroomName.endsWith("-"))
            {
                error = `De naam kan niet eindigen met een <code style="font-size:1.1em;"><b>-</b></code>`;
            }
        }else{
            error = `De naam moet beginnen met academiejaar en jaarhelft.<br />vb: <code style="font-size:1.1em;"><b><u>${getSuggestedYearPrefix()}-</u></b>S1G1-prb</code>`;
        }

        return error;
    }

    function validateAssignmentPrefix(assignmentPrefix){
        let error = null;
        const result = rules.assignment.pattern.exec(assignmentPrefix);
        rules.assignment.pattern.lastIndex = 0;

        if(result && result["1"]){
            if(!result["2"])
            {
                error = `Academiejaar en jaarhelft ontbreken. vb: <code style="font-size:1.1em;">st-<b><u>${getSuggestedYearPrefix()}-</u></b>S1G1-pe01</code>`;
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
            errorElement.style.borderColor = "#f00";
            errorElement.style.color = "#f00";
            if(elementToDisable){
                elementToDisable.setAttribute("disabled","disabled");
            }
            if(!validationMessageElement){
                validationMessageElement = document.createElement("div");
                validationMessageElement.id = validationMessageElementId;
                validationMessageElement.setAttribute("style", validationMessageElementStyle);
                errorElement.parentNode.appendChild(validationMessageElement);
            }
            validationMessageElement.innerHTML = `<div style="float:left;padding:0 10px 2em 0">&#9888;</div><span>${errorMessage}</span><div style="clear:both"></div>`;
        }
        else
        {
            errorElement.style.borderColor = "#007b00";
            errorElement.style.color = "#007b00";
            if(elementToDisable){
                elementToDisable.removeAttribute("disabled");
            }
            if(validationMessageElement) {
                validationMessageElement.parentNode.removeChild(validationMessageElement);
            }
        }
    }

    function getSuggestedYearPrefix(){
        const now = new Date();
        const jh1Start = new Date(now.getFullYear(), 9-1, 1); //1 sept
        const jh2Start = new Date(now.getFullYear()+1, 1-1, 1); //1 jan
        if(now < jh1Start){
            //ensure limits are current
            jh1Start.setFullYear(jh1Start.getFullYear() - 1);
            jh2Start.setFullYear(jh2Start.getFullYear() - 1);
        }

        let result = `${jh1Start.getFullYear().toString().substr(-2)}${jh2Start.getFullYear().toString().substr(-2)}`;
        if(now < jh2Start){
            return `${result}-1`;
        }else{
            return `${result}-2`;
        }
    }

    //ensure custom slug field is always visible
    function ensureSlugFieldVisible(){
        var slugField = document.querySelector("#slug-field");
        if(slugField){
            slugField.style.display = "";
        }
    }

    init();
})();
