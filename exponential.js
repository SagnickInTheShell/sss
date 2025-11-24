function toggleTheme() {
            const root = document.documentElement;
            const currentTheme = root.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            document.querySelector('.theme-toggle').textContent = newTheme === 'dark' ? '🌙' : '☀️';
            updateChartTheme();
        }

        document.addEventListener('DOMContentLoaded', () => {
            const savedTheme = localStorage.getItem('theme') || 'dark';
            document.documentElement.setAttribute('data-theme', savedTheme);
            document.querySelector('.theme-toggle').textContent = savedTheme === 'dark' ? '🌙' : '☀️';
        });

        function exponentialPDF(lambda, x) {
            if (x < 0) return 0;
            return lambda * Math.exp(-lambda * x);
        }

        function exponentialCDF(lambda, x) {
            if (x < 0) return 0;
            return 1 - Math.exp(-lambda * x);
        }

        let pdfChart, cdfChart;

        function getChartColors() {
            const theme = document.documentElement.getAttribute('data-theme');
            return {
                text: theme === 'dark' ? '#e0e0e0' : '#1a1a1a',
                grid: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                accent: '#f59e42',
                accentSecondary: '#f57842'
            };
        }

        function initCharts() {
            const colors = getChartColors();
            
            const pdfCtx = document.getElementById('pdf-chart').getContext('2d');
            pdfChart = new Chart(pdfCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Probability Density',
                        data: [],
                        backgroundColor: 'rgba(245, 158, 66, 0.2)',
                        borderColor: colors.accent,
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { labels: { color: colors.text } } },
                    scales: {
                        x: { grid: { color: colors.grid }, ticks: { color: colors.text } },
                        y: { grid: { color: colors.grid }, ticks: { color: colors.text }, beginAtZero: true }
                    }
                }
            });

            const cdfCtx = document.getElementById('cdf-chart').getContext('2d');
            cdfChart = new Chart(cdfCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Cumulative Probability',
                        data: [],
                        backgroundColor: 'rgba(245, 158, 66, 0.2)',
                        borderColor: colors.accentSecondary,
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { labels: { color: colors.text } } },
                    scales: {
                        x: { grid: { color: colors.grid }, ticks: { color: colors.text } },
                        y: { grid: { color: colors.grid }, ticks: { color: colors.text }, beginAtZero: true, max: 1 }
                    }
                }
            });
        }

        function updateChartTheme() {
            const colors = getChartColors();
            [pdfChart, cdfChart].forEach(chart => {
                chart.options.plugins.legend.labels.color = colors.text;
                chart.options.scales.x.grid.color = colors.grid;
                chart.options.scales.x.ticks.color = colors.text;
                chart.options.scales.y.grid.color = colors.grid;
                chart.options.scales.y.ticks.color = colors.text;
                chart.update();
            });
        }

        function updateCalculations() {
            const lambda = parseFloat(document.getElementById('lambda-input').value);
            const x = parseFloat(document.getElementById('x-input').value);

            const pdf = exponentialPDF(lambda, x);
            const cdf = exponentialCDF(lambda, x);
            const mean = 1 / lambda;
            const variance = 1 / (lambda * lambda);
            const stddev = 1 / lambda;
            const median = Math.log(2) / lambda;

            document.getElementById('pdf-result').textContent = pdf.toFixed(4);
            document.getElementById('cdf-result').textContent = cdf.toFixed(4);
            document.getElementById('mean-result').textContent = mean.toFixed(2);
            document.getElementById('variance-result').textContent = variance.toFixed(2);
            document.getElementById('stddev-result').textContent = stddev.toFixed(2);
            document.getElementById('median-result').textContent = median.toFixed(2);

            updateCharts(lambda, x);
        }

        function updateCharts(lambda, x) {
            const labels = [];
            const pdfData = [];
            const cdfData = [];
            const maxX = 5 / lambda;
            const step = maxX / 100;

            for (let i = 0; i <= maxX; i += step) {
                labels.push(i.toFixed(2));
                pdfData.push(exponentialPDF(lambda, i));
                cdfData.push(exponentialCDF(lambda, i));
            }

            pdfChart.data.labels = labels;
            pdfChart.data.datasets[0].data = pdfData;
            pdfChart.update('none');

            cdfChart.data.labels = labels;
            cdfChart.data.datasets[0].data = cdfData;
            cdfChart.update('none');
        }

        function syncInputs(sliderId, inputId, valueId, decimals = 2) {
            const slider = document.getElementById(sliderId);
            const input = document.getElementById(inputId);
            const valueDisplay = document.getElementById(valueId);

            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                input.value = value;
                valueDisplay.textContent = value.toFixed(decimals);
                updateCalculations();
            });

            input.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                slider.value = value;
                valueDisplay.textContent = value.toFixed(decimals);
                updateCalculations();
            });
        }

        document.addEventListener('DOMContentLoaded', () => {
            initCharts();
            syncInputs('lambda-slider', 'lambda-input', 'lambda-value', 2);
            syncInputs('x-slider', 'x-input', 'x-value', 2);
            updateCalculations();
        });