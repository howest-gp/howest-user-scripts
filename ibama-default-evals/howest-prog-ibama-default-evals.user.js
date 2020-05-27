// ==UserScript==
// @name         Howest PROG iBamaflex Evaluation Defaults
// @version      1.0.2
// @description  Adds default GRAD PROG Evaluations
// @namespace    http://howest.be/
// @author       sigged
// @run-at       document-idle
// @match        https://ibamaflex.howest.be/studiegidsinformatie/windows/BMFUIUpdEval.aspx*
// @grant        none
// @icon         https://raw.githubusercontent.com/howest-gp/howest-user-scripts/master/howest-prog-64.png
// @downloadURL  https://raw.githubusercontent.com/howest-gp/howest-user-scripts/master/ibama-default-evals/howest-prog-ibama-default-evals.user.js
// @updateURL    https://raw.githubusercontent.com/howest-gp/howest-user-scripts/master/ibama-default-evals/howest-prog-ibama-default-evals.user.js
// ==/UserScript==

(function() {
    'use strict';

    let form;

    function init() {

        form = document.querySelector('form');

        for(let i = 0; i < recipes.length; i++)
        {
            let buttonFillDefault = document.createElement("button");
            buttonFillDefault.innerHTML = `<img src="https://i.imgur.com/8bN5qPp.png" height="25" />&nbsp;<b>${recipes[i].name}</b>`;
            buttonFillDefault.style.borderColor = "#c00";
            buttonFillDefault.style.borderStyle = "solid";
            buttonFillDefault.style.borderWidth = "1px";
            buttonFillDefault.style.display = "inline-block";
            buttonFillDefault.style.marginRight = "5px";
            buttonFillDefault.style.marginTop = "5px";
            document.body.appendChild(buttonFillDefault);

            buttonFillDefault.onclick = function() { fillDefaults(recipes[i]); };

            if(i == 2)
                document.body.appendChild(document.createElement("br"));
        }

        forceEnableSaveButtons();
    }

    let forceEnableSaveButtons = function(){
        let saveAndAdd = $find('ctl00_cphGeneral_rbtnOpslaanEnToevoegen');
        let saveAndClose = $find('ctl00_cphGeneral_rbtnOpslaanEnAfsluiten');
        saveAndAdd.set_enabled(true);
        saveAndClose.set_enabled(true);
    }

    let fillDefaults = function (recipe)
    {
        let rcbEvalGroep = document.getElementById('ctl00_cphGeneral_rcbEvalGroep_ClientState');
        rcbEvalGroep.value = evalGroups[recipe.evalGroup]; //'{"logEntries":[],"value":"10","text":"SEM 1 academiejaar (SEM 1)","enabled":true,"checkedIndices":[],"checkedItemsTextOverflows":false}';

        let rblExKans = document.getElementById(examChances[recipe.examChance]); //document.getElementById('ctl00_cphGeneral_rblExKans_0');
        rblExKans.click();

        let rcbEvalMoment = document.getElementById('ctl00_cphGeneral_rcbEvalMoment_ClientState');
        rcbEvalMoment.value = evalMoments[recipe.evalMoment]; //'{"logEntries":[],"value":"1","text":"examenperiode 1 (1e sem) binnen examenrooster (1)","enabled":true,"checkedIndices":[],"checkedItemsTextOverflows":false}';

        let rcbEvalVorm = document.getElementById('ctl00_cphGeneral_rcbEvalVorm_ClientState');
        rcbEvalVorm.value = evalFormats[recipe.evalFormat]; //'{"logEntries":[],"value":"9","text":"examen: andere vorm of combinatie van vormen (031)","enabled":true,"checkedIndices":[],"checkedItemsTextOverflows":false}';

        let rntxtProcent = document.getElementById('ctl00_cphGeneral_rntxtProcent');
        rntxtProcent.value = recipe.percent; //'50';

        form.submit();

        forceEnableSaveButtons();
    }

    let evalGroups = {
        "Geen (GEEN)" : '{"logEntries":[],"value":"1","text":"Geen (GEEN)","enabled":true,"checkedIndices":[],"checkedItemsTextOverflows":false}',
        "SEM 1 academiejaar (SEM 1)" : '{"logEntries":[],"value":"10","text":"SEM 1 academiejaar (SEM 1)","enabled":true,"checkedIndices":[],"checkedItemsTextOverflows":false}',
        "SEM 2 academiejaar (SEM 2)" : '{"logEntries":[],"value":"11","text":"SEM 2 academiejaar (SEM 2)","enabled":true,"checkedIndices":[],"checkedItemsTextOverflows":false}'
    }

    let examChances = {
        "Eerste Examenkans" : 'ctl00_cphGeneral_rblExKans_0',
        "Tweede Examenkans" : 'ctl00_cphGeneral_rblExKans_1',
        "Geen Herexamen" : 'ctl00_cphGeneral_rblExKans_2'
    }

    let evalMoments = {
        "Examenperiode 1 (1e sem)" : '{"logEntries":[],"value":"1","text":"examenperiode 1 (1e sem) binnen examenrooster (1)","enabled":true,"checkedIndices":[],"checkedItemsTextOverflows":false}',
        "Examenperiode 2 (2e sem)" : '{"logEntries":[],"value":"2","text":"examenperiode 2 (2e sem) binnen examenrooster (2)","enabled":true,"checkedIndices":[],"checkedItemsTextOverflows":false}',
        "Examenperiode 3 (augustus/september)" : '{"logEntries":[],"value":"5","text":"examenperiode 3 (augustus/september) binnen examenrooster (3)","enabled":true,"checkedIndices":[],"checkedItemsTextOverflows":false}',
        "Examenperiode 1 buiten examenrooster (1_bis)" : '{"logEntries":[],"value":"14","text":"examenperiode 1 buiten examenrooster (1_bis)","enabled":true,"checkedIndices":[],"checkedItemsTextOverflows":false}',
        "Examenperiode 2 buiten examenrooster (2_bis)" : '{"logEntries":[],"value":"15","text":"examenperiode 2 buiten examenrooster (2_bis)","enabled":true,"checkedIndices":[],"checkedItemsTextOverflows":false}',
        "Examenperiode 3 buiten examenrooster" : '{"logEntries":[],"value":"16","text":"examenperiode 3 buiten examenrooster (3_bis)","enabled":true,"checkedIndices":[],"checkedItemsTextOverflows":false}',
    }

    let evalFormats = {
        "Examen (combi)" : '{"logEntries":[],"value":"9","text":"examen: andere vorm of combinatie van vormen (031)","enabled":true,"checkedIndices":[],"checkedItemsTextOverflows":false}',
        "Perm Evaluatie (combi)" : '{"logEntries":[],"value":"18","text":"permanente evaluatie: andere vorm of combinatie van vormen (103)","enabled":true,"checkedIndices":[],"checkedItemsTextOverflows":false}',
        "Opdracht (combi)" : '{"logEntries":[],"value":"8","text":"opdracht: andere vorm of combinatie van vormen (06)","enabled":true,"checkedIndices":[],"checkedItemsTextOverflows":false}',
    }

    let recipes = [
        {
            "name" : "SEM 1: EX 1e zit",
            "evalGroup" : "SEM 1 academiejaar (SEM 1)",
            "examChance" : "Eerste Examenkans",
            "evalMoment" : "Examenperiode 1 (1e sem)",
            "evalFormat" : "Examen (combi)",
            "percent" : "50"
        },
        {
            "name" : "SEM 1: PE 1e zit",
            "evalGroup" : "SEM 1 academiejaar (SEM 1)",
            "examChance" : "Eerste Examenkans",
            "evalMoment" : "Examenperiode 1 buiten examenrooster (1_bis)",
            "evalFormat" : "Perm Evaluatie (combi)",
            "percent" : "50"
        },
        {
            "name" : "SEM 1: EX 2e zit",
            "evalGroup" : "SEM 1 academiejaar (SEM 1)",
            "examChance" : "Tweede Examenkans",
            "evalMoment" : "Examenperiode 3 (augustus/september)",
            "evalFormat" : "Examen (combi)",
            "percent" : "100"
        },
        {
            "name" : "SEM 2: EX 1e zit",
            "evalGroup" : "SEM 2 academiejaar (SEM 2)",
            "examChance" : "Eerste Examenkans",
            "evalMoment" : "Examenperiode 1 (1e sem)",
            "evalFormat" : "Examen (combi)",
            "percent" : "50"
        },
        {
            "name" : "SEM 2: PE 1e zit",
            "evalGroup" : "SEM 2 academiejaar (SEM 2)",
            "examChance" : "Eerste Examenkans",
            "evalMoment" : "Examenperiode 1 buiten examenrooster (1_bis)",
            "evalFormat" : "Perm Evaluatie (combi)",
            "percent" : "50"
        },
        {
            "name" : "SEM 2: EX 2e zit",
            "evalGroup" : "SEM 2 academiejaar (SEM 2)",
            "examChance" : "Tweede Examenkans",
            "evalMoment" : "Examenperiode 3 (augustus/september)",
            "evalFormat" : "Examen (combi)",
            "percent" : "100"
        }
    ];

    init();
})();
