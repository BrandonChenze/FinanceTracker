document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
    // Your code to run after the DOM is ready goes here
    // e.g., adding event listeners to elements, etc.
    data = set_default_date(); // this gets the start and end date
    update_budget_data()
});


async function fetch_data(endpoint){
    let url = '/api/' + endpoint
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
    income = await fetch_data(url)
    document.getElementById('income_data').innerText = '$' + income.toFixed(2)
    return income
}

async function get_spending(start=null, end=null){
    let url = 'get_spent'
    if (start && end){
        url = url + '/' + start + '_' + end
    } 
    spent = await fetch_data(url)
    document.getElementById('total_spent').innerText = '$' + spent.toFixed(2)
    return spent
}

async function get_invested(start=null, end=null){
    let url = 'investment'
    if (start && end){
        url = url + '/' + start + '_' + end
    } 
    invested = await fetch_data(url)
    document.getElementById('total_invested').innerText = '$' + invested.toFixed(2)
    return invested
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
    // No longer being used
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

// function delete_transation(){
//     // No longer being used
//     console.log('Running')
//     delete_btns = document.querySelectorAll('#trash-btn')
//     delete_btns = document.querySelectorAll('#api_delete')
//     for (i = 0; i < delete_btns.length; ++i){
//         delete_btns[i].addEventListener("click", (e) => {
//                 console.log(e.currentTarget.id)
//                 alert('Deleting item!')
//             })
//     }
    
// }
// delete_transation()
update_budget()

async function render_transactions(filter_start, filter_end){
    test = await fetch_data('transaction/' + filter_start+ '_' +filter_end)
    console.log(test[0], test.length)
    document.getElementById('transaction_data').innerHTML = ''
    console.log('done')
    span_element = document.createElement('div')
    span_element.id = 'transaction_data'
    if(document.getElementById('transaction_data') != null){
        document.getElementById('transaction_data').innerHTML = ''
    }
    if(test.length == 0){
        span_element.innerText = 'No Data'
    } else {
        for(i = 0; i < test.length; i++){
            // console.log(test[i])
            temp_element = document.createElement('div')
            price = document.createElement('span')
            description = document.createElement('span')
            date = document.createElement('span')
            category = document.createElement('span')
            delete_btn = document.createElement('button')
            delete_btn.innerText = 'X'
            delete_btn.id = 'api_delete'
            let id = test[i]['id']
            delete_btn.addEventListener("click", (e) => {
                e.target.parentElement.remove()
                fetch_data('delete/' + id)
            })
            temp_element.id = 'transaction'
            if(test[i]['category'] == 'Income'){
                price.classList.add('income')
            } else {
                price.classList.add('credit')
            }
            price.innerText = `$${test[i]['price']}`
            description.innerText = `${test[i]['description']}`
            date.innerText = `${test[i]['date']}`
            category.innerText = `Category: ${test[i]['category']}`
            temp_element.append(date, price, description, category, delete_btn)
            span_element.append(temp_element)
        }
    }

    document.getElementById('transaction_data').replaceWith(span_element)
}

document.getElementById('filter_btn').addEventListener('click', (event) => {
    update_budget_data()
})

async function update_budget_data(){
    filter_start = document.getElementById('filter_start').value
    filter_end = document.getElementById('filter_end').value
    income = await get_income(filter_start, filter_end)
    invested = await get_invested(filter_start, filter_end)
    spent = await get_spending(filter_start, filter_end)
    remainder = income - invested - spent
    document.getElementById('remainder').innerText = '$' + remainder.toFixed(2)
    await render_transactions(filter_start, filter_end)
}