export { enableValidation, checkInputValidity };

function enableValidation(settings) {
    console.log('Enabling validation with settings:', settings);
    const formList = Array.from(document.querySelectorAll(settings.formSelector));
    console.log('Found forms:', formList);
    
    formList.forEach((formElement) => {
        console.log('Setting up validation for form:', formElement);
        setupFormValidation(formElement, settings);
    });
}

function setupFormValidation(formElement, settings) {
    console.log('Setting up form validation for:', formElement);
    const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
    const buttonElement = formElement.querySelector(settings.submitButtonSelector);
    
    console.log('Found inputs:', inputList);
    console.log('Submit button:', buttonElement);

    inputList.forEach((inputElement) => {
        // Добавляем обработчик для отметки, что поле было затронуто пользователем
        inputElement.addEventListener('blur', () => {
            inputElement.dataset.touched = 'true';
            // Проверяем валидность после потери фокуса
            checkInputValidity(formElement, inputElement, settings);
            toggleButtonState(formElement, buttonElement, settings);
        });

        // Обработчик ввода
        inputElement.addEventListener('input', () => {
            checkInputValidity(formElement, inputElement, settings);
            toggleButtonState(formElement, buttonElement, settings);
        });
    });

    // Исходное состояние кнопки
    toggleButtonState(formElement, buttonElement, settings);
    console.log('Form validation setup complete for:', formElement);
}

function checkInputValidity(formElement, inputElement, settings) {
    console.log('checkInputValidity called for:', inputElement.name, 'value:', inputElement.value);
    
    // Сбрасываем кастомное сообщение об ошибке
    inputElement.setCustomValidity('');
    
    // Проверка на пустое поле (пропускаем, если поле еще не было в фокусе)
    if (inputElement.validity.valueMissing) { 
        console.log('Field is required');
        // Показываем ошибку только если поле уже было в фокусе (пользователь взаимодействовал с ним)
        if (inputElement.dataset.touched === 'true') {
            showInputError(formElement, inputElement, 'Вы пропустили это поле.', settings);
        } else {
            hideInputError(formElement, inputElement, settings);
        }
        return;
    }
    
    // Для URL используем встроенную валидацию
    if (inputElement.type === 'url' && inputElement.validity.typeMismatch) {
        console.log('URL validation failed');
        showInputError(formElement, inputElement, inputElement.dataset.errorMessage || 'Введите корректный URL', settings);
        return;
    }
    
    // Проверка на недопустимые символы (только для текстовых полей с шаблоном)
    if (inputElement.dataset.pattern && inputElement.type !== 'url' && inputElement.value) {
        console.log('Checking pattern for:', inputElement.value);
        // Проверяем на наличие запятых и других недопустимых символов
        const hasInvalidChars = /[^A-Za-zА-Яа-яЁё\s\-]/.test(inputElement.value);
        console.log('Has invalid chars:', hasInvalidChars);
        
        if (hasInvalidChars) {
            // Используем кастомное сообщение из data-error-message
            const errorMsg = inputElement.dataset.errorMessage || 'Разрешены только латинские, кириллические буквы, знаки дефиса и пробелы';
            console.log('Showing error:', errorMsg);
            showInputError(formElement, inputElement, errorMsg, settings);
            return;
        }
    }
    
    // Проверка на минимальную длину (не для URL)
    if (inputElement.validity.tooShort && inputElement.type !== 'url') {
        console.log('Too short');
        showInputError(formElement, inputElement, `Минимальная длина: ${inputElement.minLength} симв.`, settings);
        return;
    }
    
    // Проверка на максимальную длину (не для URL)
    if (inputElement.validity.tooLong && inputElement.type !== 'url') {
        console.log('Too long');
        showInputError(formElement, inputElement, `Максимальная длина: ${inputElement.maxLength} симв.`, settings);
        return;
    }
    
    // Если дошли до сюда, значит ошибок нет
    console.log('No errors, hiding error');
    hideInputError(formElement, inputElement, settings);
    inputElement.setCustomValidity('');
}

function showInputError(formElement, inputElement, errorMessage, settings) {
  // Ищем элемент ошибки по ID инпута + '-error'
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  console.log('showInputError called', { 
    inputId: inputElement.id, 
    errorElement: errorElement,
    errorMessage: errorMessage
  });
  
  if (errorElement) {
    inputElement.classList.add(settings.inputErrorClass);
    errorElement.textContent = errorMessage;
    errorElement.classList.add(settings.errorClass);
    console.log('Error shown:', errorMessage);
  } else {
    console.error('Error element not found for input:', inputElement.id);
  }
}

function hideInputError(formElement, inputElement, settings) {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  if (errorElement) {
    inputElement.classList.remove(settings.inputErrorClass);
    errorElement.textContent = '';
    errorElement.classList.remove(settings.errorClass);
  }
}

function toggleButtonState(formElement, buttonElement, settings) {
  const isFormValid = formElement.checkValidity();
  
  if (isFormValid) {
    buttonElement.disabled = false;
    buttonElement.classList.remove(settings.inactiveButtonClass);
  } else {
    buttonElement.disabled = true;
    buttonElement.classList.add(settings.inactiveButtonClass);
  }
}

export function clearValidation(formElement, settings) {
  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const buttonElement = formElement.querySelector(settings.submitButtonSelector);

  inputList.forEach((inputElement) => {
    // Сбрасываем флаг touched при очистке формы
    inputElement.dataset.touched = 'false';
    hideInputError(formElement, inputElement, settings);
    inputElement.setCustomValidity('');
  });

  toggleButtonState(formElement, buttonElement, settings);
}