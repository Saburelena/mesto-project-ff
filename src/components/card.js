const cardTemplateContent = document.querySelector('#card-template').content; 
const cardTemplateItem = cardTemplateContent.querySelector('.places__item'); 

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
    cardElement.dataset.cardId = cardData._id;
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
        deleteButton.addEventListener('click', () => onDelete(cardData._id));
    } else {
        deleteButton.remove();
    }

    // Обработчик лайка
    likeButton.addEventListener('click', () => {
        if (onLike) {
            const currentLikedState = likeButton.classList.contains('card__like-button_is-active');
            onLike(cardData._id, currentLikedState);
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