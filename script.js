'use strict';

const debugging = false;

// Begin config
const wordsCount = 12;
const radius = 50;
const separationHorizontalDevice = 20;
const separationVerticalDevice = 25;
let separation = separationHorizontalDevice;
const speed = 50;
const initialSpeed = 35;
const inertia = 50;
// End config

let youmeus;
let youmeusContainer;
let floatingHeader;

let words = [];
let overlappingWordsAngle = 0; // Then angle where words overlap
let lastPageYOffset = -1;

let verticalDevice = false;

function animateCircles() {
    verticalDevice = window.innerHeight > window.innerWidth;
    separation = verticalDevice ? separationVerticalDevice : separationHorizontalDevice;
    const intersectionAlpha = Math.acos(separation / radius) * (180/Math.PI); // angle of intersection, counted as in usual maths from horizontal axis.
    overlappingWordsAngle = 180 + (90 - intersectionAlpha); // our coordinates start with angle 0 at the bottom, 180 at the top, plus the difference.

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
    if (debugging) {
        const debugText = `rot=${rot}, idx=${n.idx}, wa=${wa}, pos=${pos}, aa=${aa}`;
        n.l.debug.text(debugText);
        n.r.debug.text(debugText);
    }
    
    n.l.word.css('transform', wordTranslateStyle(rot, n.l.side));
    n.r.word.css('transform', wordTranslateStyle(rot, n.r.side));


    // Special case handling for first two "us" overlapping
    if (n.idx == 0 && aa < 15) {
        blurAndOpacity(n.l.youme, 0, 0);
        blurAndOpacity(n.r.youme, 0, 0);
        blurAndOpacity(n.l.us, 0, 1);
        blurAndOpacity(n.r.us, 0, 1);
        if (aa < 0.5) {
            n.r.us.css('opacity', `${aa}`);
        }
        return
    }

    const transitionDuration = 20;
    const transitionToUsStart = overlappingWordsAngle - transitionDuration / 2;
    const secondOverlappingWordsAngle = 270 + (270 - overlappingWordsAngle);
    const transitionBackStart = secondOverlappingWordsAngle - transitionDuration / 2;

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
    blurAndOpacity(from, progress, 1-progress);
    blurAndOpacity(to, 1 - progress, progress);
}

function blurAndOpacity(node, blur, opacity) {
    node.css('filter', `blur(${maxBlur * blur}em)`);
    node.css('opacity', `${opacity}`);
}

//                    .  
//              .     |    .
//        .           |
//   .                |
//   -----------------|-------
//   <----- sep ----->
//   <-------- radius ------->
function wordTranslateStyle(rot, side) {
    const unit = verticalDevice ? "vh" : "vw";
    return `translateX(${separation * side}${unit}) rotate(${-rot * side}deg) translateY(${radius}${unit}) rotate(${rot * side}deg)`;
}

function wordAngle(idx) {
   return (overlappingWordsAngle + (360 / wordsCount) * idx + 360) % 360;
}

function positionAngle(pos) {
    const t = pos * speed / 100000;
    return 360 * t % 360;
}

function init() {
    if ($(".home").length > 0) {
        console.log("there is home")
        initHome();
    }

    if ($(".about".length > 0)) {
        initAbout();
    }
}

function initHome() {
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

function initAbout() {
    $(".previewable").mouseover(function(e) {
        const id = e.target.getAttribute("data-preview");
        const preview = $(`.preview[data-preview='${id}']`);
        preview.addClass("active");
        preview.find('video').trigger('play');
    })
    $(".previewable").mouseout(function(e) {
        const id = e.target.getAttribute("data-preview");
        $(`.preview[data-preview='${id}']`).removeClass("active");
    })
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
    const sideClass = side > 0 ? 'right' : 'left'; 
    const word = $(`<div class="word ${sideClass}"></div>`);
    const youme = $(`<div class="youme abs-centered">${youmeText}</div>`);
    const us = $(`<div class="us abs-centered">${usText}</div>`);
    const debug = $(`<small class="debug"></small>`);
    word.append(youme).append(us);
    if (debugging) {
        const debugContainer = $(`<div></div>`);
        debugContainer.append(debug);
        word.append(debugContainer);
    }

    const container = $('<div class="abs-centered"></div>');
    container.append(word)
    const w = { container, word, youme, us, idx, side, debug };
    return w;
}

$(document).ready(init);