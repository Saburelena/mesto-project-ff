import { likeCard, unlikeCard } from './api';

const cardTemplateContent = document.querySelector('#card-template').content; 
const cardTemplateItem = cardTemplateContent.querySelector('.places__item');

// Обработчик лайка карточки
export function handleCardLike(cardId, isLiked) {
  const likeMethod = isLiked ? unlikeCard : likeCard;
  
  return likeMethod(cardId)
    .then(updatedCard => {
      return {
        isLiked: !isLiked,
        likesCount: updatedCard.likes.length
      };
    });
}

export function createCard({ 
    cardData, 
    onDelete, 
    onClick, 
    onLike, 
    isLiked = false, 
    likeCount = 0 
}) {
    const cardElement = cardTemplateItem.cloneNode(true);
    const cardImage = cardElement.querySelector('.card__image');
    const cardTitle = cardElement.querySelector('.card__title');
    const deleteButton = cardElement.querySelector('.card__delete-button');
    const likeButton = cardElement.querySelector('.card__like-button');
    const likeCountElement = cardElement.querySelector('.card__like-count'); // Используем существующий элемент

    // Устанавливаем данные карточки
    cardTitle.textContent = cardData.name;
    cardImage.src = cardData.link;
    cardImage.alt = cardData.name;
    likeCountElement.textContent = likeCount; // Устанавливаем количество лайков

    // Управление состоянием лайка
    if (isLiked) {
        likeButton.classList.add('card__like-button_is-active');
    }

    // Управление кнопкой удаления
    if (onDelete) {
        deleteButton.addEventListener('click', () => onDelete(cardData._id, cardElement));
    } else {
        deleteButton.remove();
    }

    // Обработчик лайка
    likeButton.addEventListener('click', () => {
        if (onLike) {
            const currentLikedState = likeButton.classList.contains('card__like-button_is-active');
            handleCardLike(cardData._id, currentLikedState)
                .then(({ isLiked: newLikedState, likesCount }) => {
                    likeButton.classList.toggle('card__like-button_is-active', newLikedState);
                    likeCountElement.textContent = likesCount;
                    onLike(cardData._id, newLikedState);
                })
                .catch(err => console.error('Ошибка при обновлении лайка:', err));
        }
    });

    // Открытие попапа с изображением
    cardImage.addEventListener('click', () => {
        if (onClick) {
            onClick(cardData.name, cardData.link);
        }
    });

    return cardElement;
}