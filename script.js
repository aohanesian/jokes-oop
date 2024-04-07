class JokeApp {
    constructor() {
        this.API = 'https://api.chucknorris.io/jokes';
        this.jokeForm = document.querySelector('#jokeForm');
        this.jokeFormCats = document.querySelector('#jokeFormCats');
        this.jokeFormSearch = document.querySelector('#jokeFormSearch');
        this.jokesContainer = document.querySelector('#jokesContainer');
        this.jokesContainerFavourites = document.querySelector('#jokesContainerFavourites');
        this.jokeForm.addEventListener('submit', e => this.handleFormSubmit(e));
        this.renderFormCats();
        this.renderFavouriteJokes();
    }

    getLocalStorage(key, defaultValue = []) {
        let storage = localStorage.getItem(key);
        storage = storage ? JSON.parse(storage) : defaultValue;
        return storage;
    }

    getData(url) {
        return fetch(url)
            .then(data => data.ok ? data.json() : Promise.reject(data.statusText))
            .catch(err => console.log(`In catch: ${err}`));
    }

    renderFormCats() {
        this.getData(this.API + '/categories')
            .then(cats => {
                this.jokeFormCats.innerHTML = cats
                    .map((cat, index) => `<li>
                        <label>
                            <input type="radio" name="jokeCat" value="${cat}" ${!index && 'checked'}>
                            ${cat}
                        </label>
                    </li>`)
                    .join('');
            });
    }

    handleFormSubmit(e) {
        e.preventDefault();

        const jokeType = this.jokeForm.querySelector('input[name="jokeFormType"]:checked').value;
        let jokeUrl = this.API;

        switch (jokeType) {
            case 'random':
                jokeUrl += '/random';
                break;
            case 'categories':
                let checkedCat = this.jokeFormCats.querySelector('input[name="jokeCat"]:checked').value;
                jokeUrl += '/random?category=' + checkedCat;
                break;
            case 'search':
                let queryValue = encodeURIComponent(this.jokeFormSearch.value);
                if (queryValue.length < 3 || queryValue.length > 120) {
                    console.error('Input length must be between 3 and 120 characters');
                    return;
                }
                jokeUrl += '/search?query=' + queryValue;
        }

        this.getData(jokeUrl)
            .then(data => data.result ? data.result.forEach(joke => this.renderJoke(joke)) : this.renderJoke(data));
    }

    renderJokeCats(cats) {
        return cats.length ?
            `<div>
                ${cats
                .map(cat => `<p class="joke__block--cat">${cat}</p>`)
                .join('')
            }
            </div>`
            : '';
    }

    renderJokeText(value) {
        return `<p class="joke__block--text">${value}</p>`;
    }

    renderJoke(joke) {
        const jokeBlock = document.createElement('div');
        jokeBlock.dataset.id = joke.id;
        jokeBlock.className = 'joke__block';
        jokeBlock.innerHTML = [this.renderJokeText(joke.value), this.renderJokeCats(joke.categories)].join('');

        const favouriteBtn = document.createElement('button');
        favouriteBtn.className = 'joke__block--fav';
        favouriteBtn.innerHTML = joke.favourite ? '💜' : '💛';
        favouriteBtn.addEventListener('click', () => this.toggleFavourite(joke, jokeBlock));

        jokeBlock.prepend(favouriteBtn);

        joke.favourite ?
            this.jokesContainerFavourites.append(jokeBlock)
            : this.jokesContainer.append(jokeBlock);
    }

    toggleFavourite(joke, jokeBlock) {
        let storageJokes = this.getLocalStorage('favouriteJokes');
        let jokeIndexInStorage = storageJokes.findIndex(item => item.id === joke.id);

        if (jokeIndexInStorage === -1) {
            joke.favourite = true;
            storageJokes.push(joke);
            this.jokesContainer.querySelector(`.joke__block[data-id="${joke.id}"] .joke__block--fav`).innerHTML = '💜';
            this.renderJoke(joke);
        } else {
            storageJokes.splice(jokeIndexInStorage, 1);
            this.jokesContainerFavourites.querySelector(`.joke__block[data-id="${joke.id}"]`).remove();

            let jokesContainerJoke = this.jokesContainer.querySelector(`.joke__block[data-id="${joke.id}"]`);
            if (jokesContainerJoke) {
                jokesContainerJoke.querySelector(`.joke__block--fav`).innerHTML = '💛';
            }
        }

        localStorage.setItem('favouriteJokes', JSON.stringify(storageJokes));
    }

    renderFavouriteJokes() {
        this.getLocalStorage('favouriteJokes').forEach(item => this.renderJoke(item));
    }
}

new JokeApp();