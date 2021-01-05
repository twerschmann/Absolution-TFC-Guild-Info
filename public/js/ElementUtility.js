const hide = (elem) => {
    elem.style.display = 'none';
}

// show an element
const show = (elem) => {
    elem.style.display = 'flex';
}

// toggle the element visibility
const toggle = (elem) => {

    // if the element is visible, hide it
    if(window.getComputedStyle(elem).display !== 'none') {
        hide(elem);
        return;
    }

    // show the element
    show(elem);
}
function setClassColor(element, cl){
    switch (cl){
        case 'Death Knight':
            element.className = 'color-DK';
            break;
        case 'Demon Hunter':
            element.className = 'color-DH';
            break;
        case 'Hunter':
            element.className = 'color-Hunter';
            break;
        case 'Druid':
            element.className = 'color-Druid';
            break;
        case 'Mage':
            element.className = 'color-Mage';
            break;
        case 'Monk':
            element.className = 'color-Monk';
            break;
        case 'Paladin':
            element.className = 'color-Paladin';
            break;
        case 'Priest':
            element.className = 'color-Priest';
            break;
        case 'Rogue':
            element.className = 'color-Rogue';
            break;
        case 'Shaman':
            element.className = 'color-Shaman';
            break;
        case 'Warlock':
            element.className = 'color-Warlock';
            break;
        case 'Warrior':
            element.className = 'color-Warrior';
            break;
    }
}