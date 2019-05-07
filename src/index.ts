import { fromEvent, Observable, throwError } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, pluck, switchMap } from 'rxjs/operators';
import './styles.css';

const searchBox: HTMLInputElement = document.getElementById('search-box') as HTMLInputElement;
const resultContainer: HTMLDivElement = document.getElementById('result-container') as HTMLDivElement;
const secuence1$: Observable<KeyboardEvent> = fromEvent(searchBox, 'keyup') as Observable<KeyboardEvent>;

type TRepo = {
    name: string;
    html_url: string;
    stargazers_count: number;
};

const search = (source$: Observable<KeyboardEvent>) => {
    return source$.pipe(
        pluck<KeyboardEvent, string>('target', 'value'),
        debounceTime(450),
        distinctUntilChanged(),
        filter((query: string) => query.length >= 3),
        switchMap((query: string) => getUsers(query)),
        pluck('items'),
        catchError((err) => {
            return throwError(err);
        })
    );
};

const getUsers = function(param: string): Promise<Response> {
    return fetch('https://api.github.com/search/repositories?q=' + param)
        .then((res) => {
            if (!res.ok) {
                throw res;
            }
            return res.json();
        });
};

const renderItems = function(items: TRepo[]): void {
    clearItems();
    for (let i: number = 0; i < items.length; i++) {
        const el: HTMLDivElement = document.createElement('div') as HTMLDivElement;
        el.classList.add('item');
        el.innerHTML = `
            <b>repo:</b>
            ${items[i].name}
            <b>stars:</b>
            ${items[i].stargazers_count}
            <b><a target="_blank" rel="noopener noreferrer" href="${items[i].html_url}">link</a></b>
        `;
        resultContainer.appendChild(el);
    }
};

const clearItems = function(): void {
    resultContainer.innerHTML = '';
};

const secuence2$: Observable<any> = search(secuence1$);
secuence2$.subscribe(items => renderItems(items), err => console.log('req error', err));
