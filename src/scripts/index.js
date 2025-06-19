import "../pages/index.css";
import { closeModal, openModal, setupModalListeners } from "../components/modal";
import { createCard } from "../components/card";
import { enableValidation, clearValidation, checkInputValidity } from "./validation";
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
  
  // Очищаем ошибки валидации
  clearValidation(profileEditForm, validationConfig);
  
  // Активируем кнопку отправки, если поля заполнены
  const isFormValid = name && about;
  const submitButton = profileEditForm.querySelector(validationConfig.submitButtonSelector);
  if (submitButton) {
    submitButton.disabled = !isFormValid;
    submitButton.classList.toggle(validationConfig.inactiveButtonClass, !isFormValid);
  }
}

function updateProfileInfo(evt) {
  evt.preventDefault();
  const submitButton = evt.target.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  
  submitButton.textContent = 'Сохранение...';
  
  updateUserInfo(profileNameInput.value, profileJobInput.value)
    .then(userData => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModal(editPopup);
    })
    .catch(err => console.error('Ошибка при обновлении профиля:', err))
    .finally(() => {
      submitButton.textContent = originalText;
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
  const submitButton = evt.target.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  
  // Проверяем валидность формы перед отправкой
  if (!newCardForm.checkValidity()) {
    return;
  }
  
  submitButton.textContent = 'Создание...';
  
  addNewCard(cardNameInput.value, cardImageUrlInput.value)
    .then(newCard => {
      renderCard(newCard, currentUserId);
      // Не сбрасываем форму здесь, чтобы пользователь видел успешное добавление
      closeModal(addPopup);
    })
    .catch(err => console.error('Ошибка при добавлении карточки:', err))
    .finally(() => {
      submitButton.textContent = originalText;
    });
}

function renderCard(cardData, userId) {
  const isOwner = cardData.owner._id === userId;
  const isLiked = cardData.likes.some(like => like._id === userId);
  
  const cardElement = createCard({
    cardData: {
      ...cardData,
      likes: cardData.likes.length
    },
    onDelete: isOwner ? handleDeleteCard : null,
    onClick: openCardPopup,
    onLike: handleLikeCard,
    isLiked,
    likeCount: cardData.likes.length
  });
  
  placesList.prepend(cardElement);
}

function handleDeleteCard(cardId) {
  openModal(deletePopup, null);
  
  deletePopup.querySelector('.popup__form').onsubmit = (evt) => {
    evt.preventDefault();
    apiDeleteCard(cardId)
      .then(() => {
        const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
        cardElement.remove();
        closeModal(deletePopup);
      })
      .catch(err => console.error('Ошибка при удалении карточки:', err));
  };
}

function handleLikeCard(cardId, isLiked) {
  const likeMethod = isLiked ? unlikeCard : likeCard;
  likeMethod(cardId)
    .then(updatedCard => {
      const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
      const likeButton = cardElement.querySelector('.card__like-button');
      const likeCountElement = cardElement.querySelector('.card__like-count');
      
      likeButton.classList.toggle('card__like-button_is-active', !isLiked);
      likeCountElement.textContent = updatedCard.likes.length;
    })
    .catch(err => console.error('Ошибка при обновлении лайка:', err));
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

// Включаем валидацию для формы аватара, если она есть
if (avatarForm) {
  enableValidation({
    formSelector: '.popup__form',
    inputSelector: '.popup__input',
    submitButtonSelector: '.popup__button',
    inactiveButtonClass: 'popup__button_disabled',
    inputErrorClass: 'popup__input_type_error',
    errorClass: 'popup__error_visible'
  });
}

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
    // Сбрасываем флаг touched для всех полей ввода
    const inputs = avatarForm.querySelectorAll(validationConfig.inputSelector);
    inputs.forEach(input => {
      input.dataset.touched = 'false';
    });
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
    
    const submitButton = avatarForm.querySelector('.popup__button');
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
    submitButton.textContent = 'Сохранение...';

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
        if (submitButton) {
          submitButton.textContent = 'Сохранить';
        }
      });
  });
} else {
  console.error('Форма аватара не найдена');
}