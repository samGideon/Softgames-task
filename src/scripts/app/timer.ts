class Test {
      
    timeout() {
        setTimeout(() => {
            console.log('Test');
            this.timeout();
        }, 1000/60);
    }
      
}