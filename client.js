const TEXTS = {
    message1: 'Привет, дружок! Говорят у тебя сегодня День рождения?',
    button1: 'Да!',
    message2: 'Да! Да! Да!',
    message3: 'Поздравляю! И желаю тебе всего-всего самого лучшего!',
    button3: 'Спасибо!',
    message4: 'Спасибо большое!!! Мне очень приятно!',
    message5: 'У меня есть для тебя подарок, но мне нужна твоя помощь....',
    button5: 'Какая?',
    message6: 'О, подарки я люблю!! Чем я могу тебе помочь??',
    message7: 'Тут такое дело..... Я играл в прятки со своими друзьями у вас в квартире и не смог никого найти...',
    button7: 'И?....',
    message8: 'И что же ты предлагаешь?',
    message9: 'Помоги мне их найти, а я в долгу не останусь - расскажу, где спрятаны твои подарки',
    button9: 'Ну.. Хорошо!',
    message10: 'Ну хорошо, я согласен тебе помочь!',
    message11: 'Отлично, тогда давай начнем!'
    //message4: '',
    //button3: 'Как же я это сделаю???',
};

let userModel = undefined;

let messageElement = (id, pos) => {
    return `
        <div class="message-container ${pos}">
           ${pos === 'left' ? '<img class="avatar" src="images/duck-right.png" alt="Аватар">' : ''}
            <div id="${id}" class="message-bubble ${pos}">
                <div class="typing-text"></div>
            </div>
            ${pos === 'right' ? '<img class="avatar" src="images/user.png" alt="Аватар">' : ''}
        </div>
    `;
}

let nextMessage = 1;

$(document).ready(function(){
    configureListeners();
    waitToHideLoader().then(

        () => {

        }

    );
});

let waitToHideLoader = async () => {
    setTimeout(
        () => {
            $(".loader-container").hide();
        },
        1000
    );
}

let showMessage = (id, message, callback) => {
    $(id).addClass("show");
    console.log($(id));
    typeLetter($(`${id} .typing-text`), message, 0, callback); // Передаем коллбек
}

let showButton = (message) => {
    $('#next-message').text(message);
    $('.next-message-container').show();
}

let typeLetter = (el, text, i, callback) => {
    if (i < text.length) {
        const char = text[i];
        el.html(el.html() + char);
        setTimeout(() => typeLetter(el, text, i + 1, callback), 50);
    } else {
        if (callback)
            callback();
    }
}

let configureListeners = () => {
    $('#next-message').on('click', (e) => {
        e.preventDefault();
        $('.next-message-container').hide().before(messageElement(`message${nextMessage}`, 'right'));

        showMessage(`#message${nextMessage}`, TEXTS[`message${nextMessage}`], () => {
            setTimeout(() => {
                nextMessage++
                $('.next-message-container').before(messageElement(`message${nextMessage}`, 'left'));
                showMessage(`#message${nextMessage}`, TEXTS[`message${nextMessage}`], () => {
                    setTimeout(() => {
                        showButton(TEXTS[`button${nextMessage}`]);
                        nextMessage++
                    }, 500);
                });
            }, 1000);

        });
    });

    $('#submit-name').on('click', (e) => {
        e.preventDefault();

        const name = $('#name-input').val();

        getUserByName(name, (user) => {
            if (!user) {
                console.log('Что-то пошло не так');
            } else {
                if (user.isNew === true) {
                    console.log('Привет, новый игрок!');
                    $('.authorization-wrapper').hide();
                    $('.hello-messaging').show();
                    nextMessage++;
                    showMessage('#message1', TEXTS.message1, () => {
                        setTimeout(() => {
                            showButton(TEXTS.button1);
                        }, 500);
                    });
                } else if (user.isNew === false) {
                    console.log('С возвращением,', user.data.username);

                }
            }
        })
    })
}

let getUserByName = async (name, callback) => {
    $.ajax({
        url: `https://duck-quest-server.onrender.com/get-user-by-name?username=${encodeURIComponent(name)}`,
        method: 'GET',
        success: (response) => {
            console.log(response);
            if (response.success) {
                const user = {
                    data: response.user,
                    isNew: false
                };
                console.log('Найден пользователь:', user);
                if (callback) callback(user);
            } else {
                console.log('Пользователь не найден, создаём...');
                createUser(name, callback);
            }
        },
        error: (xhr, status, err) => {
            console.error('Ошибка запроса:', err);
        }
    });
};

let createUser = async (name, callback) => {
    $.ajax({
        url: 'https://duck-quest-server.onrender.com/create-user',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ username: name }),
        success: (response) => {
            console.log(response);
            if (response.success) {
                const user = {
                    data: response.user,
                    isNew: true
                };
                console.log('Создан новый пользователь:', user);
                if (callback) callback(user);
            } else {
                console.warn('Не удалось создать пользователя:', response.message);
            }
        },
        error: (xhr, status, err) => {
            console.error('Ошибка при создании пользователя:', err);
        }
    });
};