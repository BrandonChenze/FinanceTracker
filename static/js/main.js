document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
    // Your code to run after the DOM is ready goes here
    // e.g., adding event listeners to elements, etc.
    data = set_default_date(); // this gets the start and end date
    get_income(data[0], data[1])
    get_spending(data[0], data[1])
});


async function call_api(endpoint){
    let url = 'http://localhost:5000/api/' + endpoint
    console.log('Sending request to '+url)
    try {
        const response = await fetch(url)
        const json = await response.json();
        return json
        
    } catch (error){
        console.error(error.message)
    }
}

async function get_income(start=null, end=null){
    let url = 'get_income'
    if (start && end){
        url = url + '/' + start + '_' + end
    } 
    income = await call_api(url)
    document.getElementById('income_data').innerText = '$' + income.toFixed(2)
}

async function get_spending(start=null, end=null){
    let url = 'get_spent'
    if (start && end){
        url = url + '/' + start + '_' + end
    } 
    spent = await call_api(url)
    document.getElementById('total_spent').innerText = '$' + spent.toFixed(2)
}


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
    return [first_day_of_month, todays_date]
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


document.getElementById('filter_btn').addEventListener('click', (event) => {
    filter_start = document.getElementById('filter_start').value
    filter_end = document.getElementById('filter_end').value
    get_income(filter_start, filter_end)
})