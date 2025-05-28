export { createCard }; 

const cardTemplateContent = document.querySelector('#card-template').content; 
const cardTemplateItem = cardTemplateContent.querySelector('.places__item'); 

function createCard({ 
    cardData, 
    onDelete, 
    onClick, 
    onLike, 
    },
) {
    const cardElement = cardTemplateItem.cloneNode(true); 
    cardElement.querySelector('.card__title').textContent = cardData.name; 
    const cardImage = cardElement.querySelector('.card__image'); 
    cardImage.src = cardData.link; 
    cardImage.alt = `${cardData.name}. ${cardData.description}`; 
    const deleteButton = cardElement.querySelector('.card__delete-button'); 
    deleteButton.addEventListener('click', (event) => { 
        onDelete(event.target); 
    });

    const likeButton = cardElement.querySelector('.card__like-button'); 
    likeButton.addEventListener('click', (event) => { 
        onLike(event.target); 
    });

    cardImage.addEventListener('click', () => 
        onClick(cardData.name, cardData.link)); 
    return cardElement; 
};
