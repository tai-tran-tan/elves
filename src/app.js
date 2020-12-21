const ws = new WebSocket('ws://localhost:8080');

const App = {
    data() {
        return {
            directories: [],
            checked: [],
            outputLog: []
        }
    },
    mounted() {
        let self = this;
        fetch('/list/dir').then(res => res.json()).then(data => self.directories = data);
        ws.onmessage = function (event) {
            const msg = event.data;
            msg.text().then(m => self.tailLog(m));
        };
    },
    methods: {
        onSubmit(event) {
            console.log(this.checked);
            this.clearLog();
            axios.post('/build', this.checked)
                .then(function (response) {
                    // console.log(response);
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        tailLog(message) {
            console.log('Read message from server ', message);
            this.outputLog.push(message);
        },
        clearLog(){
            this.outputLog = [];
        }
    }
}

const vm = Vue.createApp(App).mount('#app')

ws.onopen = function (event) {
    console.log('We\'re ready!');
};