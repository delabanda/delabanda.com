'use strict';

// Begin config
const wordsCount = 12;
const radius = 45;
const separationHorizontalDevice = 20;
const separationVerticalDevice = 30;
const speed = 50;
const initialSpeed = 35;
const inertia = 50;
// End config

let youmeus;
let youmeusContainer;
let floatingHeader;

let words = [];
let lastPageYOffset = 0;

let verticalDevice = false;

function animateCircles() {
    verticalDevice = window.innerHeight > window.innerWidth;

    const pageYOffset = window.pageYOffset;
    if (pageYOffset == lastPageYOffset) {
        requestAnimationFrame(animateCircles);
        return;
    }

    for (let i = 0; i < words.length; i++) {
        applyStyles(words[i], pageYOffset);
    }
    lastPageYOffset = pageYOffset;

    if (verticalDevice) {
        youmeus.addClass("vertical");
    } else {
        youmeus.removeClass("vertical");
    }

    if (youmeus.get(0).getBoundingClientRect().bottom < window.innerHeight / 10) {
        floatingHeader.removeClass("op-0");
        youmeusContainer.addClass("op-0");
    } else {
        if (youmeus.get(0).getBoundingClientRect().bottom > window.innerHeight / 3) {
            floatingHeader.css("display", "none");
        } else {
            floatingHeader.css("display", "block");
        }
        floatingHeader.addClass("op-0");
        youmeusContainer.removeClass("op-0");
    }

    requestAnimationFrame(animateCircles);
}


const maxBlur = 0.2;

function applyStyles(n, pos) {
    const wa = wordAngle(n.idx);
    const aa = positionAngle(pos);
    const rot = (wa+aa) % 360;
    
    n.l.word.css('transform', wordTranslateStyle(rot, n.l.side));
    n.r.word.css('transform', wordTranslateStyle(rot, n.r.side));

    const transitionToUsStart = verticalDevice ? 210 : 195;
    const transitionDuration = 20;
    const usDuration = (270 - transitionToUsStart - transitionDuration) * 2;
    const transitionBackStart = transitionToUsStart + transitionDuration + usDuration;

    if (transitionToUsStart <= rot && rot <= transitionToUsStart + transitionDuration) {
        const progress = (rot - transitionToUsStart) / transitionDuration;

        morph(n.l.youme, n.l.us, progress);
        morph(n.r.youme, n.r.us, progress);
    } else if (transitionToUsStart + transitionDuration < rot && rot < transitionBackStart) {
        morph(n.l.youme, n.l.us, 1)
        morph(n.r.youme, n.r.us, 1)
    } else if (transitionBackStart <= rot && rot <= transitionBackStart + transitionDuration) {
        const progress = (rot - transitionBackStart) / transitionDuration;
        morph(n.l.us, n.l.youme, progress);
        morph(n.r.us, n.r.youme, progress);
    } else {
        morph(n.l.us, n.l.youme, 1);
        morph(n.r.us, n.r.youme, 1);
    }
}

function morph(from, to, progress) {
    from.css('filter', `blur(${maxBlur * progress}em)`);
    from.css('opacity', `${1 - progress}`);
    to.css('filter', `blur(${maxBlur * (1 - progress)}em)`);
    to.css('opacity', `${progress}`);
}

function wordTranslateStyle(rot, side) {
    const unit = verticalDevice ? "vh" : "vw";
    const sep = verticalDevice ? separationVerticalDevice : separationHorizontalDevice;
    return `translateX(${sep * side}${unit}) rotate(${-rot * side}deg) translateY(${radius}${unit}) rotate(${rot * side}deg)`;
}

function wordAngle(idx) {
   return ((360 / wordsCount) * idx + 360) % 360;
}

function positionAngle(pos) {
    const t = pos * speed / 100000;
    return 360 * t % 360;
}

function init() {
    youmeusContainer = $("#youmeus_container")
    youmeus = $("#youmeus");

    for (let idx = 0; idx < wordsCount; idx++) {
        const w = createWords(idx);
        youmeus.append(w.l.container);
        youmeus.append(w.r.container);
        words.push(w);
    }

    const header = $("#header_container")
    floatingHeader = header
                        .clone()
                        .addClass("abs-float tr-med op-0")
                        .attr("id", "floating_header_container");
    header.after(floatingHeader);

    requestAnimationFrame(animateCircles);
}


function createWords(idx) {
    const n = {
        idx: idx,
        l: createWord('you', 'us', idx, -1),
        r: createWord('me', 'us', idx, 1),
    }

    applyStyles(n, 0);
    return n;
}

function createWord(youmeText, usText, idx, side) {
    const word = $('<div class="word"></div>');
    const youme = $(`<div class="youme abs-centered">${youmeText}</div>`);
    const us = $(`<div class="us abs-centered">${usText}</div>`);
    const debug = $(`<div><small class="debug"></small></div>`);
    word.append(youme).append(us).append(debug);

    const container = $('<div class="abs-centered"></div>');
    container.append(word)
    const w = { container, word, youme, us, idx, side, debug };
    return w;
}

$(document).ready(init);