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

        function normalPDF(x, mu, sigma) {
            const coefficient = 1 / (sigma * Math.sqrt(2 * Math.PI));
            const exponent = -Math.pow(x - mu, 2) / (2 * Math.pow(sigma, 2));
            return coefficient * Math.exp(exponent);
        }

        function erf(x) {
            const sign = x >= 0 ? 1 : -1;
            x = Math.abs(x);
            const a1 = 0.254829592;
            const a2 = -0.284496736;
            const a3 = 1.421413741;
            const a4 = -1.453152027;
            const a5 = 1.061405429;
            const p = 0.3275911;
            const t = 1.0 / (1.0 + p * x);
            const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
            return sign * y;
        }

        function normalCDF(x, mu, sigma) {
            return 0.5 * (1 + erf((x - mu) / (sigma * Math.sqrt(2))));
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
            const mu = parseFloat(document.getElementById('mu-input').value);
            const sigma = parseFloat(document.getElementById('sigma-input').value);
            const x = parseFloat(document.getElementById('x-input').value);

            const pdf = normalPDF(x, mu, sigma);
            const cdf = normalCDF(x, mu, sigma);
            const variance = sigma * sigma;
            const zscore = (x - mu) / sigma;

            document.getElementById('pdf-result').textContent = pdf.toFixed(4);
            document.getElementById('cdf-result').textContent = cdf.toFixed(4);
            document.getElementById('mean-result').textContent = mu.toFixed(2);
            document.getElementById('variance-result').textContent = variance.toFixed(2);
            document.getElementById('stddev-result').textContent = sigma.toFixed(2);
            document.getElementById('zscore-result').textContent = zscore.toFixed(2);

            updateCharts(mu, sigma, x);
        }

        function updateCharts(mu, sigma, x) {
            const labels = [];
            const pdfData = [];
            const cdfData = [];
            const start = mu - 4 * sigma;
            const end = mu + 4 * sigma;
            const step = (end - start) / 100;

            for (let i = start; i <= end; i += step) {
                labels.push(i.toFixed(2));
                pdfData.push(normalPDF(i, mu, sigma));
                cdfData.push(normalCDF(i, mu, sigma));
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
            syncInputs('mu-slider', 'mu-input', 'mu-value', 2);
            syncInputs('sigma-slider', 'sigma-input', 'sigma-value', 2);
            syncInputs('x-slider', 'x-input', 'x-value', 2);
            updateCalculations();
        });