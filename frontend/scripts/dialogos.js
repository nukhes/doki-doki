"use strict"

import { createSaveScreen } from "/scripts/saveGame.js"
import { cargarSonido } from "/scripts/cargarSonido.js"
import { Character } from "/scripts/characters.js"
import {config} from "/scripts/config.js"
import {dictionary} from "/scripts/dictionary.js"
import Background from "/scripts/backgrounds.js"
import {managePoem} from "/scripts/managePoem.js"

//config stuff
const you = config.getName();
let enableMusic = config.getMusic();
let textSpeed = config.getTextSpeed();
const chapter = config.getChapter();
const route = config.getRoute();
const addRoute = config.getAditionalRoute();
let i = config.getGameIndex();
const inScreenCharacters = config.getScreenCharacters();
const {sayScore,natScore,yuScore} = config.getScore();
const choices = config.getChoices();
let currentChoice = 0;

console.log(sayScore, natScore, yuScore)


//GLOBALS

const hoverSound = cargarSonido("https://firebasestorage.googleapis.com/v0/b/vamosaprobarpitos.appspot.com/o/musica%2Fhover.ogg?alt=media&token=69a7fd4d-f846-4215-87e7-96dc46e0149c");
const selectSound = cargarSonido("https://firebasestorage.googleapis.com/v0/b/vamosaprobarpitos.appspot.com/o/musica%2Fselect.ogg?alt=media&token=02f9acb0-aa26-41f4-97c8-68eac0a0a5e7");

const mainScreen = document.querySelector(".mainScreen");
const pngChar = document.getElementById("char");
const charName = document.getElementById("char-name");
const textBox = document.getElementById("text-box");
let skipInterval;
let music;
let arrDialog = [];
let auxDialogArray = [];
let selectionMenu = [];
let selectionOptions = {};
let next = "";

let audioN
let audioS 
let audioM 
let audioY 
let audioNeutral 


//variables to save game
let {song, currentBackground, currentImg} = config.getExtra()

manageImage(currentImg)
manageBackground(currentBackground)

//instance of characters and background
let sayori = new Character("sayori")
let yuri = new Character("yuri")
let natsuki = new Character("natsuki")
let monika = new Character("monika")
let charBg = new Background()

function takeCharactersToScreen () {
    let left = true
    inScreenCharacters.map(x=>{
        if(x !== "char"){
            x.left = left;
            x.new = true;
            x.char = x.charName.charAt(0).toUpperCase() + x.charName.slice(1)
            manageNewCharacter(x);
        }
        else left = false;
    })
    

};
takeCharactersToScreen()

//init
fetch(chapter)
    .then (res => res.json())
    .then (async x => {
        // acá arranca el programa. antes de que se empiece a ejecutar la función que recorre el array al que se le hizo fetch,
        // el programa observa el primer elemento en busca de configuraciones globales
        next = x[0]?.next;
        if( x[0].usesRoute) {
            if(!route) window.open("/Poem", "_self")
            else{
                const res = await fetch(chapter + "/" + route)
                const resJson = await res.json();
                resJson.forEach(y => auxDialogArray.push(y))
            }
        }
    
        let sumIndex = 0;

        x.forEach((element, index) => {
            
            if (index + sumIndex <= i && element.newCharacter && element.newCharacter !=="erase") {
                //todo este quilombo es para arrancar el juego cuando cargas la partida y hay muchos personajes en pantalla
                element.newCharacter.forEach(y => {
                    if (y.charImg) manageNewCharacter({ "char": y.char, "charImg": y.charImg })
                })
            }
            if (element.newRoute) {
                arrDialog.push(...auxDialogArray);
                sumIndex = auxDialogArray.length
            }
            if (element.charImg) {
                if(element.charImg.background) encodeImg(dictionary(element.charImg.background))
                encodeImg (dictionary[element.charImg]);
            }
            if (element.newCharacter) encodeImg (dictionary[element.newCharacter.charImg])

            if (index + sumIndex <= i && element.musicGroup && (enableMusic !== "false" || !enableMusic)) {
                manageMusicGroup(element.musicGroup)
            }

            if (index + sumIndex <= i && element.selectMenu){

                selectionMenu = element.selectMenu.map(objChar => { return objChar })

                if (element.dependsOnRoute) {
                    selectionOptions.Monika = element.Monika.concat(element.Monika[0][route]);

                    if (sayScore < 30) selectionOptions.Sayori = element.Sayori.dislike
                    else if (sayScore >= 30 && sayScore < 45) selectionOptions.Sayori = element.Sayori.like
                    else selectionOptions.Sayori = element.Sayori.love
                    if (yuScore < 30) selectionOptions.Yuri = element.Yuri.dislike;
                    else if (yuScore >= 30 && yuScore < 45) selectionOptions.Yuri = element.Yuri.like;
                    else selectionOptions.Yuri = element.Yuri.love

                    if (natScore < 30) selectionOptions.Natsuki = element.Natsuki.dislike;
                    else if (natScore >= 30 && natScore < 45) selectionOptions.Natsuki = element.Natsuki.like;
                    else selectionOptions.Natsuki = element.Natsuki.love;

                    selectionOptions.Sayori = [...selectionOptions.Sayori, ...element.Sayori.end]
                    selectionOptions.Yuri = [...selectionOptions.Yuri, ...element.Yuri.end]
                    selectionOptions.Natsuki = [...selectionOptions.Natsuki, ...element.Natsuki.end]
                    selectionOptions.Monika = [...selectionOptions.Monika, ...element.Monika[0].end]
                }
                else{
                    selectionOptions.Sayori = element.Sayori;
                    selectionOptions.Yuri = element.Yuri;
                    selectionOptions.Natsuki = element.Natsuki;
                    selectionOptions.Monika = element.Monika
                }

                for(currentChoice; currentChoice < choices.length; currentChoice++){
                    if (selectionMenu.length >= 4) {
                        arrDialog.splice(index + sumIndex, 0, ...selectionMenu.find(y => { return y.char === choices[currentChoice] }).message)
                        sumIndex = sumIndex + 2
                    }
                    let finded = selectionMenu.find(x => x.char === choices[currentChoice]);
                    let indexFinded = selectionMenu.indexOf(finded)
                    selectionMenu.splice(indexFinded, 1)

                    if (selectionOptions[choices[currentChoice]]){
                        arrDialog.splice(index + sumIndex, 0, ...selectionOptions[choices[currentChoice]])

                        sumIndex = sumIndex + selectionOptions[choices[currentChoice]].length
                    }
                    element = {}

                    if(selectionMenu.length < 1) break;
                }

            }

            //
            arrDialog.push(element)
            //
        });
    
        mainScreen.addEventListener("click",runDialog)
    })


music = cargarSonido("/api/sound/music/" + song)

if (music && i > 0 && (enableMusic !== "false" || !enableMusic)) music.play();

function runDialog(skipInterval) {

    if ((arrDialog[i]?.selectMenu || arrDialog[i]?.poem) && skipInterval === "skipping") return "stop"

    mainScreen.removeEventListener("click", runDialog)

    if (arrDialog[i]) manageProperties(arrDialog[i]);
    else {
        config.setRoute("")
        config.setAditionalRoute([])
        config.setScore(0, 0, 0)
        config.setChapter(next);
        config.setGameIndex(0);
        config.setChoices([])
        window.location.reload()
    } 
    i++;
}

function manageProperties(objDialog){
    if(objDialog.newCharacter){
        if (objDialog.newCharacter == "erase") {
            try{mainScreen.removeChild(sayori.png)}catch{}
            try{mainScreen.removeChild(yuri.png)}catch{}
            try{mainScreen.removeChild(monika.png)}catch{} 
            try{mainScreen.removeChild(natsuki.png)}catch{}    
        }
        else objDialog.newCharacter.forEach(obj =>manageNewCharacter(obj))
    }
    if(objDialog.newBackground){
        manageBackground(objDialog.newBackground);
    }
    if(objDialog.animation){
        objDialog.animation.forEach(animation => manageAnimation(animation))
    }
    if(objDialog.music) manageMusic(objDialog.music)
    if(objDialog.musicGroup && (enableMusic !== "false" || !enableMusic) )  manageMusicGroup(objDialog.musicGroup)
    if(objDialog.usesVar) {
        objDialog.content = objDialog.content.replace("#var", you)
    }
    if(objDialog.char) {
        if(charName.classList.contains("toggler")) charName.classList.remove("toggler");
        if (objDialog.char === "nobody") charName.classList.add("toggler")
        else if (objDialog.char === "you") charName.innerHTML = you; 
        else charName.innerHTML = objDialog.char;
    }
    if (objDialog.charImg) manageImage(objDialog.charImg);
    
    if (!objDialog.content){
        i++;
        runDialog();
    }
    else addAnimatedText(objDialog.content);

    if(objDialog.selectMenu){
        document.removeEventListener("keydown", keyDownPress)

        if(objDialog.selectMenu === "continue"){
            createSelectionMenu ()
        }
        else createSelectionMenu(objDialog.selectMenu, objDialog, true)
    }
    if(objDialog.poem)managePoem(objDialog.poem)
    if(objDialog.options) manageOptions(objDialog)
}

function manageOptions(optionObj){
    //si la opcion es "ya entregaste el poema a"
    if(optionObj.shownCharacter){
        if (selectionMenu.filter(filtered => filtered.char === optionObj.shownCharacter)[0]) addAnimatedText(optionObj.optionalText[1])
        else if (optionObj.optionalText[0]) {
            addAnimatedText(optionObj.optionalText[0])
        }
        else { i++; runDialog() }
    }
    else if (optionObj.route){
        if(optionObj.route == route) arrDialog.splice(i + 1, 0, ...optionObj.option1)
        else arrDialog.splice(i + 1, 0, ...optionObj.option2)
    }

}

function addAnimatedText(text) {
    textBox.innerHTML = ""
    let j = 0;
    mainScreen.addEventListener("click", printFullText)
    function printFullText() {
        mainScreen.removeEventListener("click", printFullText);
        textBox.innerHTML = text;
        j = text.length;
    }
    if (!text) return;
    
    if (skipInterval) {
        let arrText = text.split(" ");
        let interval = setInterval(function() {
            if(arrText[j] !== undefined) {
                textBox.innerHTML += arrText[j] + " ";
                j++
            }
            else{
                clearInterval(interval);
                mainScreen.addEventListener("click", runDialog)
            }
        },4)
    }else{
        let interval = setInterval(function () {
            if (text[j] !== undefined) {
                textBox.innerHTML += text[j]
                j++;
            }
            else {
                clearInterval(interval);
                mainScreen.addEventListener("click", runDialog)
            }
        }, textSpeed);     
    }

}

function manageBackground(background){

    let overScreen = document.createElement("div")
    overScreen.classList.add("crosser");
    if(background === "transition"){
        mainScreen.appendChild(overScreen);
        setTimeout(() => mainScreen.removeChild(overScreen), 500)
    }
    else if (background.noTransition){
        mainScreen.style.backgroundImage = "url('" + dictionary[background.src] + "')"
        currentBackground = mainScreen.style.backgroundImage;
    }
    else{
        mainScreen.appendChild(overScreen);
        setTimeout(() => {
            if (background[background.length - 1] === ")") mainScreen.style.backgroundImage = background
            else mainScreen.style.backgroundImage = "url('" + dictionary[background] + "')"
            setTimeout(() => mainScreen.removeChild(overScreen), 500)
        }, 500)

        if(dictionary[background]) currentBackground = "url('" + dictionary[background] + "')"
        else currentBackground = background
        pngChar.src = "";
        textBox.innerHTML = "";
    }
}

function manageImage(img){
    if(!img) pngChar.src = "";
    else if (typeof img === "object"){
        if (!img.background) try{mainScreen.removeChild(charBg.domImg)}catch(e){}
        else{ 
            if(charBg.domImg.src){
            charBg.defineImgWithAnimation(img.background)
            }
            else{
                charBg.defineImg(img.background)
                charBg.append();
            }
        currentBackground = "url(" + dictionary[img.background] + ")"
        }
    }

    else{
        if (img[img.length - 1] != "g"){ pngChar.src = ""}
        else {
            pngChar.src = dictionary[img]
            currentImg = img;
        }
    }
}
function encodeImg(imgSrc) {
    const imgToInsert = document.createElement("img");
    imgToInsert.src = imgSrc
    document.body.appendChild(imgToInsert);
    imgToInsert.style.display = "none"
}

function manageMusic(musicSrc) {
    try {
        music.pause()
        document.body.removeChild(music)
    } catch { }
    if(musicSrc !=="stop"){
        music = cargarSonido("/api/sound/music/" + musicSrc, true);
        song = musicSrc
        if (enableMusic !== "false" || !enableMusic) music.play()
    }
}

function manageMusicGroup(group){

    if (group.new){

        try {
            music.pause()
        } catch(e){}

        audioN = cargarSonido("/api/sound/music/" + group.nat, true)
        audioM = cargarSonido("/api/sound/music/" + group.mon, true)
        audioS = cargarSonido("/api/sound/music/" + group.say, true)
        audioY = cargarSonido("/api/sound/music/" + group.yu, true)
        audioNeutral = cargarSonido("/api/sound/music/" + group.neutral, true)

        audioNeutral.play()
    }
    else if(group === "n"){
        audioN.play();
        audioN.currentTime = audioNeutral.currentTime
        audioNeutral.muted = true;
    }
    else if (group === "s") {
        audioS.play();
        audioS.currentTime = audioNeutral.currentTime
        audioNeutral.muted = true;
    }
    else if (group === "y") {
        audioY.play();
        audioY.currentTime = audioNeutral.currentTime
        audioNeutral.muted = true;
    }
    else if (group === "m") {
        audioM.play();
        audioM.currentTime = audioNeutral.currentTime
        audioNeutral.muted = true;
    }
    else if (group === "neutral"){
        audioNeutral.muted = false;
        audioM.pause();
        audioY.pause();
        audioN.pause();
        audioS.pause();
    }
    else if (group ==="end"){
        music.play()
        document.body.removeChild(audioM)
        document.body.removeChild(audioN)
        document.body.removeChild(audioS)
        document.body.removeChild(audioY)
        document.body.removeChild(audioNeutral)
    }
    
}

//add new character to the Screen
function manageNewCharacter(obj){
    if (obj.char === "Sayori") {
        if (obj.new) {
            if (obj.left) {
                sayori.append(true)
            }
            else (sayori.append())
        }
        if (obj.charImg) {
            sayori.defineImg(obj.charImg)
        }
        if (obj.hide) {
            if(obj.hide == "hide") sayori.hide()
            else sayori.unhide()
        }
    };
    if (obj.char === "Yuri") {
        if (obj.new) {
            if (obj.left) {
                yuri.append(true)
            }
            else (yuri.append())
        }
        if (obj.charImg) {
            yuri.defineImg(obj.charImg)
        }
        if (obj.hide) {
            if(obj.hide == "hide")yuri.hide()
            else yuri.unhide()
            
        }
    }
    if (obj.char === "Natsuki") {
        if (obj.new) {
            if (obj.left) {
                natsuki.append(true)
            }
            else (natsuki.append())
        }
        if (obj.charImg) {
            natsuki.defineImg(obj.charImg)
        }
        if (obj.hide) {
            if (obj.hide == "hide") natsuki.hide()
            else natsuki.unhide()
        }
    }
    if (obj.char === "Monika") {
        if (obj.new) {
            if (obj.left) {
                monika.append(true)
            }
            else (monika.append())
        }
        if (obj.charImg) {
            monika.defineImg(obj.charImg)
        }
        if (obj.hide) {
            if(obj.hide == "hide") monika.hide();
            else monika.unhide()
        }
    }
    
}
    
//animations
function manageAnimation(objAnimation){
    if(!objAnimation.char){
        if (objAnimation.direction === "height") {
            char.style.height = objAnimation.value;
        }
        else if (objAnimation.direction === "top"){
            char.style.top = objAnimation.value;
        }
        else if(objAnimation.direction === "left"){
            char.style.left = objAnimation.value;
        }
        else if(objAnimation.direction === "jump"){
            if(char.classList.contains("jump-animation")) char.classList.remove("jump-animation")
            char.classList.add("jump-animation")
            setTimeout(function () {
                char.classList.remove("jump-animation");
            },600)
        }
        else if (objAnimation.direction === "return"){
            char.style.left = "0%"
            char.style.top="0%"
            char.style.height ="100%"
        }
    }
    else if(objAnimation.char === "Yuri"){
        yuri.animation(objAnimation.direction, objAnimation.value)
    }
    else if(objAnimation.char === "Natsuki"){
        natsuki.animation(objAnimation.direction, objAnimation.value)
    }
    else if(objAnimation.char === "Monika"){
        monika.animation(objAnimation.direction, objAnimation.value)
    }
    else if(objAnimation.char === "Sayori"){
        sayori.animation(objAnimation.direction, objAnimation.value)
    }
}

//selectionMenu
function createSelectionMenu(arrChar, objDialog, isNew) {

    if(arrChar) selectionMenu = arrChar.map(objChar => {return objChar})


    if(isNew && objDialog.dependsOnRoute) {

        selectionOptions.Monika = objDialog.Monika.concat(objDialog.Monika[0][route]);

        if (sayScore < 30) selectionOptions.Sayori = objDialog.Sayori.dislike
        else if( sayScore >= 30 && sayScore < 45 ) selectionOptions.Sayori = objDialog.Sayori.like
        else selectionOptions.Sayori = objDialog.Sayori.love

       if(yuScore < 30) selectionOptions.Yuri = objDialog.Yuri.dislike;
       else if (yuScore >= 30 && yuScore < 45) selectionOptions.Yuri = objDialog.Yuri.like;
       else selectionOptions.Yuri = objDialog.Yuri.love

        if (natScore < 30) selectionOptions.Natsuki = objDialog.Natsuki.dislike;
        else if (natScore >= 30 && natScore < 45) selectionOptions.Natsuki = objDialog.Natsuki.like;
        else selectionOptions.Natsuki = objDialog.Natsuki.love;

        selectionOptions.Sayori = [...selectionOptions.Sayori, ...objDialog.Sayori.end]
        selectionOptions.Yuri = [...selectionOptions.Yuri, ...objDialog.Yuri.end]
        selectionOptions.Natsuki = [...selectionOptions.Natsuki, ...objDialog.Natsuki.end]
        selectionOptions.Monika = [...selectionOptions.Monika, ...objDialog.Monika[0].end]
    }
    //if ! depends on route
    else if(isNew){
        selectionOptions.Sayori = objDialog.Sayori;
        selectionOptions.Yuri = objDialog.Yuri;
        selectionOptions.Natsuki = objDialog.Natsuki;
        selectionOptions.Monika = objDialog.Monika
    }
    if(!selectionMenu.length){
        textBox.innerHTML=""
        document.addEventListener("keydown", keyDownPress)
        return
    }

    const selectionContainer = document.createDocumentFragment();
    const selectContainer = document.createElement("div")
    selectContainer.classList.add("selection-container")
    selectContainer.addEventListener("click",(e) =>{e.stopPropagation()})

    selectionMenu.forEach( x => {
        const charSelect = document.createElement("div");
        charSelect.classList.add("selection-btn", x.char)
        charSelect.innerHTML = x.content;
        charSelect.addEventListener("mouseover",()=> hoverSound.play())
        charSelect.addEventListener("click",(e)=>{ 
            selectSound.play();
            mainScreen.removeChild(selectContainer)
            document.addEventListener("keydown", keyDownPress)
            arrDialog.splice(i,0,...selectionOptions[e.target.classList[1]])

            if (selectionMenu.length >= 4) arrDialog.splice(i, 0, ...selectionMenu.find(y => { return y.char === e.target.innerHTML }).message)

            //fake click
            const event = new MouseEvent("click", {})
            mainScreen.dispatchEvent(event)
            //
            selectionMenu = selectionMenu.filter(filtered => filtered.char !== e.target.classList[1])
            choices.push(e.target.classList[1])
        })
        selectContainer.appendChild(charSelect) 
    })
    selectionContainer.appendChild(selectContainer)
    mainScreen.appendChild(selectionContainer)    
}

//options
function saveGame(option) {
    const inScreenCharacters = document.querySelectorAll(".char")
    const arrDays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
    const arrMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let dateToSave = new Date()
    let fullDate = `${arrDays[dateToSave.getDay()]}, ${arrMonths[dateToSave.getMonth()]} ${dateToSave.getDate()} ${dateToSave.getFullYear()}, ${dateToSave.getHours()}:${dateToSave.getMinutes()}`
    const objectToSave = {
        inScreenCharacters:[], 
        doki_currentGame: i,
        date: fullDate,
        chapter: chapter,
        choices:choices,
        route:route,
        addRoute: addRoute, 
        song:song, 
        img:currentImg, 
        background:currentBackground,
        score:[sayScore, natScore, yuScore]
    }
    
    for (let index = 0; index < inScreenCharacters.length; index++) {
        if(inScreenCharacters[index].id) objectToSave.inScreenCharacters.push("char")
        else if (inScreenCharacters[index].classList.contains("hidden")) objectToSave.inScreenCharacters.push({ charName: inScreenCharacters[index].classList[1], hide:"hide"})
        else objectToSave.inScreenCharacters.push({charName: inScreenCharacters[index].classList[1]})
    }
    
    const saveScreen = createSaveScreen(option, objectToSave)
    mainScreen.appendChild(saveScreen)
    document.getElementById("return").addEventListener("click", () =>{mainScreen.removeChild(mainScreen.lastElementChild)})
    document.getElementById("save-btn").addEventListener("click", () => { mainScreen.removeChild(mainScreen.lastElementChild); saveGame("Save")})
    document.getElementById("load-btn").addEventListener("click", () => { mainScreen.removeChild(mainScreen.lastElementChild); saveGame("Load")})
    document.getElementById("delete-btn").addEventListener("click", () => { mainScreen.removeChild(mainScreen.lastElementChild); saveGame("Delete")})
    document.getElementById("menu-btn").addEventListener("click", () => {window.open("/", "_self") })

    
}

function showStory() {
    let index = i;
    if (index >= 15) index = index - 15;
    else index = 0;
    let history = "";
    for (index; index < i; index++) {
        if (arrDialog[index].char && arrDialog[index].char != "nobody") history += arrDialog[index].char + ": ";
        history += arrDialog[index].content + "\n";
    }
    alert(history)
}
function skip() {
    if (!skipInterval) {
        skipInterval = setInterval(() => {
            const skipping = runDialog("skipping");
            if (skipping) {
                clearInterval(skipInterval);
                skipInterval = null;
            }
        }, 150)
    }
    else {
        clearInterval(skipInterval)
        skipInterval = null;
    }
}
const openMenu = () => {
    window.open("/", "_self")
}

let options = document.getElementById("options")
options.addEventListener("click", function(e){
    e.stopPropagation();
    if(e.target.id === "history") showStory()
    else if (e.target.id ==="skip") skip()
    else if (e.target.id ==="load") saveGame("Load")
    else if (e.target.id === "save") saveGame("Save")
    else if (e.target.id ==="menu") openMenu()
})



//resice mainScreen
const resize = () => {
    if (screen.height < 720){
        mainScreen.style.height = (screen.height - 50) +"px";
        let auxWidth = ((screen.height - 50) * 1280) / 720
        mainScreen.style.width = auxWidth + "px";
        mainScreen.style.fontSize = (auxWidth * 26 / 1280) + "px" 
    }
}

//key pressing

function keyDownPress(e) {
    if (e.key === " ") {
        const event = new MouseEvent("click", {

        })
        mainScreen.dispatchEvent(event)
    }
}
document.addEventListener("keydown", keyDownPress)

window.addEventListener('resize', resize);
resize();

export {mainScreen as mainScreen}