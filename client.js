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
    message7: 'Тут такое дело..... Я играл в прятки со своими друзьями-утятами у вас дома и не смог никого найти...',
    button7: 'И?....',
    message8: 'И что же ты предлагаешь?',
    message9: 'Помоги мне их найти, а я в долгу не останусь - расскажу, где спрятаны твои подарки',
    button9: 'Ну.. Хорошо!',
    message10: 'Ну хорошо, я согласен тебе помочь! Мне нужно знать что-то еще?',
    message11: 'Отлично, тогда давай начнем! При нажатии следующей кнопки тебя перенесет в игру. В ней тебе надо будет вводить номера уже найденных уточек. ',
    button11: 'Что еще?',
    message12: 'Звучит просто! Что-то еще?',
    message13: 'При достижении каждой контрольной точки тебе будет сообщено, где спрятан подарок один из подарков. Если понадобиться какая-то помощь - в поле ответов достаточно будет ввести слово "помощь" и я рандомно расскажу тебе факт о месте какого-то из братанов. А теперь удачи в поисках! Я пойду пока попью хлеб похаваю!',
    button13: 'Начать игру!'
};

const PRESENT = {
    first: `По секрету, мне рассказали, что этот подарок спрятан в твоем секретном месте... Не знаю чтобы это могло значить...`,
    second: `Ммм... Не знаю как у вас у людей это называется, но это довольно большой и яркий объект в вашем доме.`,
    third: `Подыщи-ка мне подходящую шляпку, тогда возможно и подарок найдешь..`
}

const STATUS = {
    ALREADY_FOUND: 'already_found',
    INCORRECT_VALUE: 'incorrect_value',
    SUCCESS: 'success',
    NOT_SAVED: 'not_saved',
};

let username = undefined;

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

let foundDuck = (duck) => {
    return `
        <div class="duck-card revealed" data="${duck._id}">
            <img src="images/duck-left.png" alt="Утка ${duck.duck_number}">
            <div class="number">#${duck.duck_number}</div>
        </div>
    `;
}

let notFoundDuck = (duck) => {
    return `
        <div class="duck-card secret" data="${duck._id}">?</div>
    `;
}

let nextMessage = 1;

$(document).ready(function () {
    configureListeners();
    waitToHideLoader().then(
        () => {

        }
    );
});

let waitToShowLoader = async () => {
    $(".loader-container").show();
}

let waitToHideLoader = async (time) => {
    if (!time) time = 1000
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

        if (nextMessage > 13) {
            $('.hello-messaging').hide();
            waitToShowLoader().then(() => {
                startGame();
            })
        } else {
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
        }
    });

    $('#submit-name').on('click', (e) => {
        e.preventDefault();

        waitToShowLoader().then(() => {
            const name = $('#name-input').val();
            getUserByName(name, (user) => {
                if (!user) {
                    console.log('Что-то пошло не так');
                } else {
                    console.log(user)
                    username = user.data.username;

                    if (user.isNew === true) {
                        waitToHideLoader(100).then(() => {
                            console.log('Привет, новый игрок!');
                            $('.authorization-wrapper').hide();
                            $('.hello-messaging').show();
                            nextMessage++;
                            showMessage('#message1', TEXTS.message1, () => {
                                setTimeout(() => {
                                    showButton(TEXTS.button1);
                                }, 500);
                            });
                        })
                    } else if (user.isNew === false) {
                        console.log('С возвращением,', user.data.username);
                        $('.authorization-wrapper').hide();
                        startGame();
                    }
                }
            })
        })
    })

    $('#btn1').on('click', (e) => {
        e.preventDefault();
        showModal(PRESENT.first, 'sounds/help.mp3', 5000);
    })

    $('#btn2').on('click', (e) => {
        e.preventDefault();
        showModal(PRESENT.second, 'sounds/help.mp3', 5000);
    })

    $('#btn3').on('click', (e) => {
        e.preventDefault();
        showModal(PRESENT.third, 'sounds/help.mp3', 5000);
    })
}

let getUserByName = async (name, callback) => {
    $.ajax({
        url: `https://duck-quest-server.onrender.com/get-user-by-name?username=${encodeURIComponent(name)}`,
        method: 'GET',
        success: (response) => {
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
        data: JSON.stringify({username: name}),
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

let getUserDucks = async () => {
    try {
        const response = await fetch(`https://duck-quest-server.onrender.com/user-ducks/${encodeURIComponent(username)}`);
        const data = await response.json();

        if (data.success) {
            const ducks = {
                all: data.all,
                found: data.found,
                notFound: data.notFound
            };
            return ducks;
        } else {
            console.log('Пользователь не найден...');
            return null;
        }
    } catch (error) {
        console.error('Ошибка запроса:', error);
        return null;
    }
};

let startGame = () => {
    defineProgressBar();
    defineButtons();
    defineDucksGrid().then(() => {
        waitToHideLoader().then(() => {
            $('.game-container').show();
        })
    });

    $('#answer-input').on('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const value = $('#answer-input').val();

            if (value === "") {
                console.log("Пустое значение")
            } else if (Number.isInteger(Number(value))) {
                console.log('Целое число');
                checkDuckNumber(value).then((status) => {
                    console.log(status);

                    let message = undefined;
                    let sound = undefined;
                    if (status.status === STATUS.SUCCESS) {
                        message = `
                            <p>Ура, найдена новая уточка!</p>
                            ${foundDuck(status.duck)}
                        `;
                        sound = 'sounds/win.mp3';

                        if (status.getNow) {
                            if (status.checkPoint === 1) {
                                message = `
                                    <p>Ура, найдена новая уточка!</p>
                                    <p>Ты нашел уже ${status.foundCount} уточек, а это значит, что тебе стала доступна подсказка по поиску первого подарка!!!!</p>
                                    ${foundDuck(status.duck)}
                                `;
                                $(`#btn${status.checkPoint}`).show();
                            } else if (status.checkPoint === 2) {
                                message = `
                                    <p>Ура, найдена новая уточка!</p>
                                    <p>Ты нашел уже ${status.foundCount} уточек, а это значит, что тебе стала доступна подсказка по поиску второго подарка!!!!</p>
                                    ${foundDuck(status.duck)}
                                `;
                                $(`#btn${status.checkPoint}`).show();
                            } else if (status.checkPoint === 3) {
                                message = `
                                    <p>Ура, найдена новая уточка!</p>
                                    <p>Ты нашел все ${status.foundCount} уточек! Спасибо большое!! Выдал тебе последнюю подсказку!!</p>
                                    
                                    ${foundDuck(status.duck)}
                                `;
                                $(`#btn${status.checkPoint}`).show();
                                sound = 'sounds/pobeda.mp3';
                            }
                        }

                        showModal(message, sound).then(() => {
                            if (status.status === STATUS.SUCCESS) {
                                updateProgressBar();
                                $(`.duck-card.secret[data="${status.duck._id}"]`).after(foundDuck(status.duck)).remove();
                            }
                        })
                    } else if (status.status === STATUS.ALREADY_FOUND) {
                        message = "<p>Упс, эту уточку ты уже находил..</p>";
                        sound = 'sounds/error.mp3';
                        showModal(message, sound).then(() => {
                            if (status.status === STATUS.SUCCESS) {
                                updateProgressBar();
                                $(`.duck-card.secret[data="${status.duck._id}"]`).after(foundDuck(status.duck)).remove();
                            }
                        })
                    } else if (status.status === STATUS.INCORRECT_VALUE) {
                        message = "<p>Некорректное значение! Проверь номер!</p>";
                        sound = 'sounds/error.mp3';
                        showModal(message, sound).then(() => {
                            if (status.status === STATUS.SUCCESS) {
                                updateProgressBar();
                                $(`.duck-card.secret[data="${status.duck._id}"]`).after(foundDuck(status.duck)).remove();
                            }
                        })
                    } else if (status.status === STATUS.NOT_SAVED) {
                        message = "Не удалось сохранить, попробуй еще раз!"
                        sound = 'sounds/error.mp3';
                        showModal(message, sound).then(() => {
                            if (status.status === STATUS.SUCCESS) {
                                updateProgressBar();
                                $(`.duck-card.secret[data="${status.duck._id}"]`).after(foundDuck(status.duck)).remove();
                            }
                        })
                    }
                });
            } else if (value.toLowerCase() === 'подсказка' || value === '?') {
                getHelpText().then(msg => {
                    showModal(msg, 'sounds/help.mp3', 5000);
                })
            } else {
                console.log('Некорректное значение');
            }
        }
    });
}

let checkDuckNumber = async (number) => {
    let ducks = await getUserDucks();
    const isExist = ducks.all.find(d => d.duck_number === number) !== undefined;

    if (isExist) {
        const isFound = ducks.found.find(d => d.duck_number === number) !== undefined;
        if (isFound) {
            return {status: STATUS.ALREADY_FOUND};
        }
        const notFound = ducks.notFound.find(d => d.duck_number === number);

        let result = await addDuckToUser(notFound._id);
        // addDuckToUser(notFound._id).then((result) => {
        if (result) {
            let totalSteps = ducks.all.length
            let countFound = ducks.found.length + 1;
            let checkPoints = [0, Math.floor(totalSteps / 100 * 20), Math.floor(totalSteps / 100 * 50), totalSteps];

            let checkPoint = 0;
            let getNow = false;

            if (countFound >= checkPoints[1]) {
                checkPoint = 1;
                getNow = countFound === checkPoints[1]
            }
            if (countFound >= checkPoints[2]) {
                checkPoint = 2;
                getNow = countFound === checkPoints[2]
            }
            if (countFound >= checkPoints[3]) {
                checkPoint = 3;
                getNow = countFound === checkPoints[3]
            }

            return {
                status: STATUS.SUCCESS,
                duck: notFound,
                checkPoint: checkPoint,
                getNow: getNow,
                foundCount: countFound
            };
        } else {
            return {status: STATUS.NOT_SAVED};
        }
    }

    return {status: STATUS.INCORRECT_VALUE};
}

async function addDuckToUser(duckId) {
    console.log("addDuckToUser");
    console.log(duckId);
    try {
        const response = await fetch('https://duck-quest-server.onrender.com/add-duck', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username, duckId})
        });

        const data = await response.json();

        if (data.success) {
            console.log('Утка добавлена!');
            return true;
        } else {
            console.warn('⚠ Ошибка:', data.message);
            return false;
        }
    } catch (error) {
        console.error('Ошибка запроса:', error);
        return false;
    }
}

let defineButtons = async () => {
    let ducks = await getUserDucks();
    let totalSteps = ducks.all.length;
    let checkPoints = [0, Math.floor(totalSteps / 100 * 20), Math.floor(totalSteps / 100 * 50), totalSteps];
    let foundDucks = ducks.found.length;


    if (foundDucks >= checkPoints[1]) {
        $('#btn1').show();
    }
    if (foundDucks >= checkPoints[2]) {
        $('#btn2').show();
    }
    if (foundDucks >= checkPoints[3]) {
        $('#btn3').show();
    }
}

let defineProgressBar = async () => {
    let ducks = await getUserDucks();
    let totalSteps = ducks.all.length;
    let checkPoints = [0, Math.floor(totalSteps / 100 * 20), Math.floor(totalSteps / 100 * 50), totalSteps];

    console.log(checkPoints);
    const progressBar = $('.progress-wrapper .progress-bar');
    const duck = $('.progress-wrapper .duck');
    const progressContainer = $('.progress-wrapper .progress-container');

    // Проверяем, что контрольные точки не превышают общее количество делений
    const validCheckpoints = checkPoints.filter(cp => cp <= totalSteps);
    const progressWidth = (ducks.found.length / ducks.all.length) * 100;

    // Обновляем ширину прогресс-бара и позицию утки
    progressBar.css({width: progressWidth + '%'});
    duck.css({left: progressWidth + '%'});

    // Добавляем контрольные точки
    validCheckpoints.forEach(cp => {
        const leftPosition = (cp / totalSteps) * 100;

        const $checkpoint = $('<div></div>')
            .addClass('checkpoint')
            .css('left', leftPosition + '%');

        progressContainer.append($checkpoint);
    });
}

let getHelpText = async () => {
    let ducks = await getUserDucks();
    if (ducks.notFound.length === 0) {
        return "Ты нашел уже всех уточек!!!"
    }

    shuffle(ducks.notFound);

    return ducks.notFound[0].help_text;
}

let updateProgressBar = async () => {
    let ducks = await getUserDucks();

    const duck = $('.progress-wrapper .duck');
    const progressBar = $('.progress-wrapper .progress-bar');

    const progressWidth = (ducks.found.length / ducks.all.length) * 100;
    progressBar.css({width: progressWidth + '%'});
    duck.css({left: progressWidth + '%'});
}

let defineDucksGrid = async () => {
    let ducks = await getUserDucks();

    shuffle(ducks.all);

    ducks.all.forEach(duck => {
        const isFound = ducks.found.find(d => d._id === duck._id) !== undefined;

        if (isFound) {
            $('.duck-grid').append($(foundDuck(duck)))
        } else {
            $('.duck-grid').append($(notFoundDuck(duck)))
        }
    });
}

let shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

let showModal = async (message, audioPath, duration = 3000) => {
    const $overlay = $('#modal-overlay');
    $('#modal-content').html(message);

    $overlay.addClass('show');

    let audio;
    if (audioPath) {
        audio = new Audio(audioPath);
        await audio.play();
    }


    setTimeout(() => {
        $overlay.removeClass('show');
        // if (audioPath) {
        //     audio.stop();
        // }
    }, duration);
}