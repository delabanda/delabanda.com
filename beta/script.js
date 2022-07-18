'use strict';

let words = [];

const wordsCount = 12;
const radius = 45;
const separation = 20;
const speed = 70;
const offset = 0;

let lastT = 0;

function animateCircles() {
    const t = -1 * ($(window).scrollTop() + offset) * speed / 100000;
    if (t != lastT) {
        for (let i = 0; i < words.length; i++) {
            applyStyles(words[i], t);
        }
        lastT = t;
    }
    requestAnimationFrame(animateCircles);
}

const transitionToUsStart = 195;
const transitionDuration = 20;
const usDuration = (270 - transitionToUsStart - transitionDuration) * 2;
const transitionBackStart = transitionToUsStart + transitionDuration + usDuration;

const maxBlur = 0.2;

function applyStyles(n, t) {
    const rot = angle(n.idx, t);
    n.l.word.css('transform', wordTranslateStyle(rot, n.l.side));
    n.r.word.css('transform', wordTranslateStyle(rot, n.r.side));

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
    from.css('opacity', `${1-progress}`);
    to.css('filter', `blur(${maxBlur * (1-progress)}em)`);
    to.css('opacity', `${progress}`);
}

function wordTranslateStyle(rot, side) {
    return `translateX(${separation * side}vw) rotate(${-rot * side}deg) translateY(${radius}vw) rotate(${rot * side}deg)`;
}

function angle(idx, t) {
    return (360 * t * -1 + (360 / wordsCount) * idx + 360) % 360;
}

function init() {
    for (let idx = 0; idx < wordsCount; idx++) {
        let youmeus = $("#youmeus");

        const w = createWords(idx);

        youmeus.append(w.l.container);
        youmeus.append(w.r.container);
        words.push(w);
    }

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
    const w = { container, word, youme, us, idx, side };
    return w;
}

$(document).ready(init);