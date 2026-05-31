document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
    set_default_date(); // this gets the start and end date
    update_ui()
    document.getElementById('filter_btn').addEventListener('click', (event) => {
        update_ui()
    })
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
    return [first_day_of_month, todays_date]
}


async function render_transactions(filter_start, filter_end){
    test = await fetch_data('transaction/' + filter_start+ '_' +filter_end)
    span_element = document.createElement('div')
    span_element.id = 'transaction_data'
    if(document.getElementById('transaction_data') != null){
        document.getElementById('transaction_data').innerHTML = ''
    }
    if(test.length == 0){
        span_element.innerText = 'No Data'
    } else {
        for(i = 0; i < test.length; i++){
            temp_element = document.createElement('div')
            temp_element.id = 'transaction'
            price = document.createElement('span')
            description = document.createElement('span')
            date = document.createElement('span')
            category = document.createElement('span')
            delete_btn = document.createElement('button')
            delete_btn.innerText = 'X'
            confirm_btn = document.createElement('button')
            confirm_btn.innerText = 'Update'
            let id = test[i]['id']
            delete_btn.addEventListener("click", (e) => {
                e.target.parentElement.remove()
                fetch_data('delete/' + id)
            })
            confirm_btn.addEventListener("click", (e) => {
                child_nodes = e.target.parentElement.childNodes
                child_nodes.forEach(element => {
                    if(element instanceof HTMLInputElement){
                        temp_span = document.createElement('span')
                        temp_span.innerText = element.value
                        temp_span.classList = element.classList
                        __add_edit_event_listener(temp_span)
                        element.replaceWith(temp_span)
                    }
                });
                data = {
                    'price': child_nodes[1].innerText,
                    'description': child_nodes[2].innerText,
                    'category': child_nodes[3].innerText
                }
                post_data('update/'+ id, data)
                update_ui()
            })
            __add_edit_event_listener(category)
            __add_edit_event_listener(price)
            __add_edit_event_listener(description)

            if(test[i]['category'] == 'Income'){
                price.classList.add('income')
            } else {
                price.classList.add('credit')
            }
            price.innerText = `$${test[i]['price']}`
            description.innerText = `${test[i]['description']}`
            date.innerText = `${test[i]['date']}`
            category.innerText = `${test[i]['category']}`
            temp_element.append(date, price, description, category, confirm_btn, delete_btn)
            span_element.append(temp_element)
        }
    }

    document.getElementById('transaction_data').replaceWith(span_element)
}

async function update_budget_data(filter_start, filter_end){
    income = await get_income(filter_start, filter_end)
    invested = await get_invested(filter_start, filter_end)
    spent = await get_spending(filter_start, filter_end)
    remainder = income - invested - spent
    document.getElementById('remainder').innerText = '$' + remainder.toFixed(2)
    
}

async function update_category_data(filter_start, filter_end){
    filter_start = document.getElementById('filter_start').value
    filter_end = document.getElementById('filter_end').value
    let category_data = await fetch_data('categories/'+filter_start+'_'+filter_end)
    new_field_set = document.createElement('fieldset')
    new_field_set.classList.add('budgeting')
    new_field_set.id = 'categories'
    legend = document.createElement('Legend')
    legend.innerText = 'Categories'
    new_field_set.append(legend)
   
    Object.entries(category_data).forEach((e) => {
        if(e[0] != 'Income'){
            temp_span = document.createElement('span')
            temp_span.innerText = `${e[0]} - $${e[1]}`
            temp_span.classList.add('budgeting_item')
            new_field_set.append(temp_span)
        }
    })
    document.getElementById('categories').replaceWith(new_field_set)
}

async function update_ui(){
    filter_start = document.getElementById('filter_start').value
    filter_end = document.getElementById('filter_end').value
    update_budget_data(filter_start, filter_end)
    update_category_data(filter_start, filter_end)
    render_transactions(filter_start, filter_end)
}

function __add_edit_event_listener(element){
    element.addEventListener("click", (e) => {
        previous_text = e.target.innerText
        edit_text = document.createElement('input')
        edit_text.value = previous_text
        edit_text.classList = e.target.classList
        e.target.replaceWith(edit_text)
    })
}
