import "../pages/index.css"; 
import { initialCards } from "../components/cards"; 
import { closeModal, openModal, setupModalListeners } from "../components/modal"; 
import { createCard } from "../components/card";

// Форма, которая позволяет редактировать профиль:
const profileEditForm = document.querySelector('[name="edit-profile"]');
const profileNameInput = profileEditForm.querySelector('.popup__input_type_name'); 
const profileJobInput = profileEditForm.querySelector('.popup__input_type_description'); 

const profileTitle = document.querySelector('.profile__title'); 
const profileDescription = document.querySelector('.profile__description'); 

// Форма, которая позволяет добавить новую карточку
const newCardForm = document.querySelector('[name="new-place"]'); 
const cardNameInput = newCardForm.querySelector('.popup__input_type_card-name'); 
const cardImageUrlInput = newCardForm.querySelector('.popup__input_type_url'); 
const imagePopup =   document.querySelector('.popup_type_image'); 
const popupImage = imagePopup.querySelector('.popup__image'); 
const popupCaption = imagePopup.querySelector('.popup__caption'); 
const placesList = document.querySelector('.places__list'); 


// Отображение начального набора карточек из массива initialCards
initialCards.forEach(function (cardData) { 
    renderCard(cardData, "append"); 
});

const addCardButton =  document.querySelector('.profile__add-button'); 
const addPopup =   document.querySelector('.popup_type_new-card'); 
addCardButton.addEventListener('click', () => openModal(addPopup, null)); 

const editProfileButton =  document.querySelector('.profile__edit-button'); 
const editPopup =   document.querySelector('.popup_type_edit'); 
editProfileButton.addEventListener('click', () => openModal(editPopup, prepareEditPopup)); 

newCardForm.addEventListener('submit', addNewCard); 

const popUps = document.querySelectorAll(".popup"); 
popUps.forEach(setupModalListeners); 

// Функция, которая выполняется перед открытием попапа редактирования профиля:
function prepareEditPopup() {
    profileNameInput.value = profileTitle.textContent; 
    profileJobInput.value = profileDescription.textContent; 
};

// Функция, которая вызывается при отправке формы редактирования профиля:
function updateProfileInfo(evt) {
    evt.preventDefault();
    [profileTitle, profileDescription].forEach((el, i) => 
        el.textContent = [profileNameInput, profileJobInput][i].value);
    closeModal(editPopup);
};

profileEditForm.addEventListener('submit', updateProfileInfo ); 

// Функция для открытия попапа с изображением:
function openCardPopup( title, link) {
    popupImage.src = link; 
    popupImage.alt = title; 
    popupCaption.textContent = title; 

    openModal(imagePopup, null); 
};

// Функция, которая вызывается при отправке формы добавления новой карточки:
function addNewCard(evt) { 
    evt.preventDefault();
    renderCard({ name: cardNameInput.value, link: cardImageUrlInput.value });
    newCardForm.reset();
    closeModal(addPopup);
};

//Функция для добавления карточки на страницу:
function renderCard(item, insertMethod  = "prepend") {
    placesList[ insertMethod  ]( 
        createCard( 
            {
                cardData: item, 
                onDelete : deleteCard, 
                onClick: openCardPopup, 
                onLike: likeCard, 
            },
        
        ),
    );
};

// Функция для добавления/удаления лайка:
function likeCard (likeButton) {
    likeButton.classList.toggle("card__like-button_is-active"); 
};

// Функция для удаления карточки:
function deleteCard(delButton) {
    const listItem = delButton.closest('.card'); 
    listItem.remove(); 
};    

