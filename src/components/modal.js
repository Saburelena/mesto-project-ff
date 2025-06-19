// Функция для установки слушателей событий на модальное окно
export const setupModalListeners = (modalWindow) => {
    if (!modalWindow) return;
    
    modalWindow.classList.add("popup_is-animated");
    
    // Обработчик клика по кнопке закрытия
    const closeButton = modalWindow.querySelector('.popup__close');
    if (closeButton) {
        closeButton.addEventListener('click', () => closeModal(modalWindow));
    }
    
    // Обработчик клика по оверлею
    modalWindow.addEventListener('click', (event) => {
        if (event.target === modalWindow) {
            closeModal(modalWindow);
        }
    });
};

// Функция для открытия попапа
export function openModal(popup, beforeFunction) {
    if (!popup) return;
    
    if (beforeFunction && typeof beforeFunction === 'function') {
        beforeFunction();
    }
    
    popup.classList.add("popup_is-opened");
    document.addEventListener('keydown', handleEscClose);
}

// Функция для закрытия попапа
export function closeModal(popup) {
    if (!popup) return;
    
    popup.classList.remove("popup_is-opened");
    document.removeEventListener('keydown', handleEscClose);
}

// Функция для обработки нажатия клавиши Esc
function handleEscClose(event) {
    if (event.key === 'Escape') {
        const openedPopup = document.querySelector('.popup_is-opened');
        if (openedPopup) {
            closeModal(openedPopup);
        }
    }
}