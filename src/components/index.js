import "../pages/index.css";
import { closeModal, openModal, setupModalListeners } from "../components/modal";
import { createCard, handleCardLike } from "../components/card";
import { 
  getUserInfo, 
  getInitialCards, 
  updateUserInfo, 
  addNewCard, 
  deleteCard as apiDeleteCard, 
  likeCard, 
  unlikeCard,
  updateAvatar 
} from "./api";
import { enableValidation, clearValidation, checkInputValidity } from "./validation";

// Управление состоянием кнопок
function renderLoading(button, isLoading, loadingText = 'Сохранение...', originalText = 'Сохранить') {
  button.textContent = isLoading ? loadingText : originalText;
  button.disabled = isLoading;
  
  // Добавляем/удаляем класс для стилизации состояния загрузки
  if (isLoading) {
    button.classList.add('popup__button_loading');
  } else {
    button.classList.remove('popup__button_loading');
  }
}

// Настройки валидации
const validationConfig = {
  formSelector: '.popup__form',
  inputSelector: '.popup__input',
  submitButtonSelector: '.popup__button',
  inactiveButtonClass: 'popup__button_disabled',
  inputErrorClass: 'popup__input_type_error',
  errorClass: 'popup__error_visible'
};

// Включение валидации
enableValidation(validationConfig);

// DOM элементы
const profileEditForm = document.querySelector('[name="edit-profile"]');
const profileNameInput = profileEditForm.querySelector('.popup__input_type_name');
const profileJobInput = profileEditForm.querySelector('.popup__input_type_description');
const newCardForm = document.querySelector('[name="new-place"]');
const cardNameInput = newCardForm.querySelector('.popup__input_type_card-name');
const cardImageUrlInput = newCardForm.querySelector('.popup__input_type_url');
const profileTitle = document.querySelector('.profile__title');
const profileDescription = document.querySelector('.profile__description');
const profileImage = document.querySelector('.profile__image');
const imagePopup = document.querySelector('.popup_type_image');
const popupImage = imagePopup.querySelector('.popup__image');
const popupCaption = imagePopup.querySelector('.popup__caption');
const placesList = document.querySelector('.places__list');
const addCardButton = document.querySelector('.profile__add-button');
const addPopup = document.querySelector('.popup_type_new-card');
const editProfileButton = document.querySelector('.profile__edit-button');
const editPopup = document.querySelector('.popup_type_edit');
const deletePopup = document.querySelector('.popup_type_confirm');

let currentUserId = null;

// Инициализация при загрузке страницы
function loadInitialData() {
  // Загружаем данные пользователя и карточки
  Promise.all([getUserInfo(), getInitialCards()])
    .then(([userData, cards]) => {
      // Сохраняем ID текущего пользователя
      currentUserId = userData._id;
      
      // Обновляем данные профиля
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      profileImage.style.backgroundImage = `url(${userData.avatar})`;
      
      // Очищаем контейнер с карточками
      placesList.innerHTML = '';
      
      // Отображаем карточки
      cards.forEach(card => {
        placesList.append(renderCard(card, currentUserId));
      });
    })
    .catch(err => {
      console.error('Ошибка при загрузке данных:', err);
    });
}

// Запускаем загрузку данных
loadInitialData();

// Настройка обработчиков событий
setupModalListeners();

// Обработчики кнопок
addCardButton.addEventListener('click', () => {
  prepareAddCardPopup();
  openModal(addPopup);
});

editProfileButton.addEventListener('click', () => {
  prepareEditPopup();
  openModal(editPopup);
});

// Обработчики форм
newCardForm.addEventListener('submit', handleAddNewCard);
profileEditForm.addEventListener('submit', updateProfileInfo);

// Инициализация всех попапов
document.querySelectorAll('.popup').forEach(popup => {
  setupModalListeners(popup);
});

// Функции
function prepareEditPopup() {
  // Заполняем поля формы текущими значениями профиля
  const name = profileTitle.textContent;
  const about = profileDescription.textContent;
  
  profileNameInput.value = name || '';
  profileJobInput.value = about || '';
  
  // Очищаем ошибки валидации и обновляем состояние кнопки
  // Функция clearValidation сама вызовет toggleButtonState
  clearValidation(profileEditForm, validationConfig);
}

function updateProfileInfo(evt) { 
  evt.preventDefault(); 
  const submitButton = evt.submitter || evt.target.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  
  renderLoading(submitButton, true, 'Сохранение...', originalText);
  
  updateUserInfo(profileNameInput.value, profileJobInput.value)
    .then(userData => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModal(editPopup);
    })
    .catch(err => console.error('Ошибка при обновлении профиля:', err))
    .finally(() => {
      renderLoading(submitButton, false, 'Сохранение...', originalText);
    });
}

// Функция для подготовки попапа добавления карточки
function prepareAddCardPopup() {
  if (!newCardForm) return;
  
  // Сбрасываем форму
  newCardForm.reset();
  
  // Очищаем ошибки валидации
  clearValidation(newCardForm, validationConfig);
  
  // Убедимся, что все поля валидны
  const inputs = newCardForm.querySelectorAll(validationConfig.inputSelector);
  inputs.forEach(input => {
    checkInputValidity(newCardForm, input, validationConfig);
  });
  
  // Фокус на первое поле ввода
  const firstInput = inputs[0];
  if (firstInput) {
    setTimeout(() => firstInput.focus(), 100);
  }
}

function handleAddNewCard(evt) {
  evt.preventDefault();
  const submitButton = evt.submitter || evt.target.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  
  // Проверяем валидность формы перед отправкой
  if (!newCardForm.checkValidity()) {
    return;
  }
  
  renderLoading(submitButton, true, 'Создание...', originalText);
  
  addNewCard(cardNameInput.value, cardImageUrlInput.value)
    .then(newCard => {
      const cardElement = renderCard(newCard, currentUserId);
      placesList.prepend(cardElement);
      // Не сбрасываем форму здесь, чтобы пользователь видел успешное добавление
      closeModal(addPopup);
    })
    .catch(err => console.error('Ошибка при добавлении карточки:', err))
    .finally(() => {
      renderLoading(submitButton, false, 'Создание...', originalText);
    });
}

function renderCard(cardData, userId) {
  const isOwner = cardData.owner._id === userId;
  const isLiked = cardData.likes.some(like => like._id === userId);
  
  const cardElement = createCard({
    cardData: {
      ...cardData,
      likes: cardData.likes || []
    },
    onDelete: isOwner ? handleDeleteCard : null,
    onLike: handleLikeCard,
    onClick: openCardPopup,
    isLiked,
    likeCount: cardData.likes.length
  });
  
  return cardElement;
}

function handleDeleteCard(cardId, cardElement) {
  openModal(deletePopup, null);
  
  deletePopup.querySelector('.popup__form').onsubmit = (evt) => {
    evt.preventDefault();
    apiDeleteCard(cardId)
      .then(() => {
        cardElement.remove();
        closeModal(deletePopup);
      })
      .catch(err => console.error('Ошибка при удалении карточки:', err));
  };
}

function handleLikeCard(cardId, isLiked) {
  // Теперь эта функция просто уведомляет о том, что лайк был обновлен
  // Вся логика обработки лайка вынесена в card.js
  console.log(`Лайк для карточки ${cardId} обновлен. Новое состояние: ${isLiked ? 'лайкнуто' : 'не лайкнуто'}`);
}

function openCardPopup(title, link) {
  popupImage.src = link;
  popupImage.alt = title;
  popupCaption.textContent = title;
  openModal(imagePopup, null);
}

// Получаем элементы аватара
const avatarPopup = document.querySelector('.popup_type_avatar');
const avatarForm = document.forms['edit-avatar'];
const avatarUrlInput = avatarForm ? avatarForm.querySelector('.popup__input_type_url') : null;
const profileImageEditButton = document.querySelector('.profile__image-edit-button');

// Проверяем, что элементы существуют
console.log('profileImage:', profileImage);
console.log('profileImageEditButton:', profileImageEditButton);
console.log('avatarForm:', avatarForm);
console.log('avatarUrlInput:', avatarUrlInput);
console.log('avatarPopup:', avatarPopup);

// Обработчик открытия попапа
if (profileImageEditButton && avatarForm && avatarUrlInput && avatarPopup) {
  profileImageEditButton.addEventListener('click', () => {
    console.log('Клик по кнопке редактирования аватара');
    avatarForm.reset();
    clearValidation(avatarForm, validationConfig);
    openModal(avatarPopup);
  });
} else {
  console.error('Не удалось найти необходимые элементы для работы с аватаром');
}

// Обработчик отправки формы
if (avatarForm) {
  avatarForm.addEventListener('submit', (evt) => {
    evt.preventDefault();
    console.log('Отправка формы аватара');
    
    const submitButton = evt.submitter || avatarForm.querySelector('.popup__button');
    if (!submitButton) {
      console.error('Не найдена кнопка отправки формы');
      return;
    }
    
    const avatarUrl = avatarUrlInput.value.trim();
    if (!avatarUrl) {
      console.error('URL аватара не может быть пустым');
      return;
    }
    
    console.log('Попытка обновить аватар на URL:', avatarUrl);
    const originalText = submitButton.textContent;
    renderLoading(submitButton, true, 'Сохранение...', originalText);

    updateAvatar(avatarUrl)
      .then((userData) => {
        console.log('Аватар успешно обновлен:', userData);
        if (profileImage) {
          profileImage.style.backgroundImage = `url(${userData.avatar})`;
        } else {
          console.error('Не найден элемент для отображения аватара');
        }
        closeModal(avatarPopup);
      })
      .catch((err) => {
        console.error('Ошибка при обновлении аватара:', err);
        // Показываем ошибку пользователю
        const errorElement = avatarForm.querySelector('.popup__error');
        if (errorElement) {
          errorElement.textContent = 'Не удалось обновить аватар. Проверьте URL и попробуйте снова.';
          errorElement.style.display = 'block';
        }
      })
      .finally(() => {
        renderLoading(submitButton, false, 'Сохранение...', originalText);
      });
  });
} else {
  console.error('Форма аватара не найдена');
}