export {
    closeModal,
    openModal
};

// Функция для установки слушателей событий на модальное окно:
export const setupModalListeners = (modalWindow) => {

    modalWindow.classList.add("popup_is-animated"); 
    const closeButton = modalWindow.querySelector('.popup__close'); 
    closeButton.addEventListener('click', () => { 
        closeModal(modalWindow);
    }); 

    modalWindow.addEventListener('click', (event) => { 
        if (!event.target.classList.contains(".popup__content")) { 
            closeModal(event.target);
        };
    });
};

// Функция для открытия попапа:
function openModal(popup, beforeFunction) {
    if (beforeFunction !== null) { 
        beforeFunction(); 
    };
    popup.classList.add("popup_is-opened"); 
    document.addEventListener("keydown", handleEscClose); 
};

// Функция для закрытия попапа:
function closeModal(popup) {
    popup.classList.remove("popup_is-opened"); 
    document.removeEventListener("keydown", handleEscClose);
};

// Функция для обработки нажатия клавиши Esc:
function handleEscClose(event) {
    if (event.key === "Escape") { 
        const openedPopup = document.querySelector(".popup_is-opened"); 
        if (openedPopup) closeModal(openedPopup); 
    };
};
