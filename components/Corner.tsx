const Corner = () => {
    return (
        <div>
            <a href="https://github.com" target="_blank"
            rel="noopener noreferrer"
            className="github-corner"
            aria-label="View source on GitHub"
            >
                <svg
                    width="80"
                    height="80"
                    viewBox="0 0 250 250"
                    style={{
                        fill: '#151513',
                        color: '#fff',
                        position: 'absolute',
                        top: 0,
                        border: 0,
                        right: 0,
                    }}
                    aria-hidden="true"
                >
                    <path d="M0 0h250v250H0z"></path>
                    <path
                        d="M128 0c-35.3 0-64 28.7-64 64 0 28.3 18.4 52.2 43.8 60.6 3.2.6 4.3-1.4 4.3-3.1v-11.1c-17.9 3.9-21.7-7.7-21.7-7.7-2.9-7.5-7-9.5-7-9.5-5.7-3.9.4-3.8.4-3.8 6.3.4 9.7 6.5 9.7 6.5 5.6 9.7 14.7 6.9 18.3 5.3.6-4 2.2-6.9 4-8.5-14.3-1.6-29.4-7.2-29.4-32.1 0-7.1 2.5-13 6.6-17.6-.7-1.6-2.8-8.1.6-16.8 0 0 5.3-1.7 17.4 6.6 5-1.4 10.4-2.1 15.7-2.1 5.3 0 10.7.7 15.7 2.1 12-8.3 17.4-6.6 17.4-6.6 3.4 8.7 1.3 15.2.6 16.8 4.1 4.6 6.6 10.5 6.6 17.6 0 25-15.2 30.4-29.6 32 2.3 2 4.3 5.8 4.3 11.6v17.2c0 1.7 1.1 3.8 4.3 3.1C173.6 116.2 192 92.3 192 64c0-35.3-28.7-64-64-64z"
                        fill="currentColor"
                    ></path>
                </svg>
            </a>
        </div>
    );
};

export default Corner;
