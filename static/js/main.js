document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
    // Your code to run after the DOM is ready goes here
    // e.g., adding event listeners to elements, etc.
    set_default_date();
    
});


function set_default_date(){
    today = new Date();
    element = document.getElementById('date_input');
    if (element == null){
        return
    }
    filter_start = document.getElementById('filter_start');
    filter_end = document.getElementById('filter_end');
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    todays_date = yyyy + '-' + mm + '-' + dd;
    first_day_of_month = yyyy + '-' + mm + '-01';
    element.value = todays_date;
    filter_end.value = todays_date;
    filter_start.value = first_day_of_month;
}

function update_budget(){
    budget_input = document.getElementById("budget_input")
    if (budget_input == null){
        return
    }
    budget_input.addEventListener("input", (e) => {
        budget = parseInt(document.getElementById("budget_input").value)
        document.getElementById("budget_value").textContent = budget
        total_spent = parseInt(document.getElementById("total_spent").textContent)
        document.getElementById("budget_percent").textContent =  ((total_spent / budget) * 100).toFixed(2)
    })
    
}

function delete_transation(){
    console.log('Running')
    delete_btns = document.querySelectorAll('#trash-btn')
    for (i = 0; i < delete_btns.length; ++i){
        delete_btns[i].addEventListener("click", (e) => {
                console.log(e.currentTarget.id)
                alert('Deleting item!')
            })
    }
    
}
delete_transation()
update_budget()