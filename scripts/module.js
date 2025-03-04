//module main entry




Hooks.once("init", async function () {
    console.log("init cthulhu-dark custom module...");

    // enregistrement des fonctions handlebar pour répéter l'affichege des boutons de santé

    Handlebars.registerHelper('ifgt', function (a, b, options) {
        if (a > b) { return options.fn(this); }
        return options.inverse(this);
    });
    // booleans if if equal if greater etc...
    Handlebars.registerHelper('ife', function (arg1, arg2, options) {
        return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });
    // loop with named index
    Handlebars.registerHelper('repeat', function (times, start, indexLabel, block) {
        var accum = '';
        if (!indexLabel) { indexLabel = "index" }
        if (!start) { start = 0; }
        for (var i = start; i < times + start; ++i) {
            block.data[indexLabel] = i;
            block.data.first = i === start;
            block.data.last = i === (times + start - 1);
            accum += block.fn(this);
        }
        return accum;
    });


});
// for existing actors
Hooks.on("renderActorSheet", async (sheet, data, options, userId) => {
    if (sheet.actor.type === "character" && !sheet.actor.system.health) {
        actor.update({
            "system.health": {
                value: 10,
                min: 0,
                max: 10
            }
        });
    };
    // injection de l'html pour afficher la santé
    if (!sheet.element[0].querySelector('.cthulhu-dark-custom')) {
        let content = await renderTemplate(`modules/cthulhu_dark_custom/templates/health.hbs`, { actor: sheet.actor });
        sheet.element[0].querySelector('.insight').insertAdjacentHTML('afterend', content);
    }
    // ajout d'un écouteur sur les inputs de santé 
    // si déjà checked alors update à -1
    if (sheet.element[0].querySelectorAll('.cthulhu-dark-custom [type="radio"]')) {
        sheet.element[0].querySelectorAll('.cthulhu-dark-custom [type="radio"]').forEach(function (input) {
            input.addEventListener('click', function (ev) {
                if (input.checked) {
                    sheet.actor.update({ "system.health.value": parseInt(ev.target.value) - 1 });
                }
            })
        })


    }
});

// check health on actor.system
Hooks.on("updateActor", (actor, data, options, userId) => {
    if (data.system?.health) {
        let newHealth = Math.clamp(data.system.health.value, 0, 10);
        actor.update({ "system.health.value": newHealth });
    }
});

// creation de health à la creation des character
Hooks.on("preCreateActor", (actor, data, options, userId) => {
    if (actor.type === "character" && !actor.system.health) {
        actor.update({
            "system.health": {
                value: 10,
                min: 0,
                max: 10
            }
        });
    }
});