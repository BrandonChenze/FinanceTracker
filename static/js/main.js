document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
    set_default_date(); // this gets the start and end date
    update_ui()
    change_date()
    upload_csv()
    add_transaction()
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

            let id = test[i]['id']
            price = document.createElement('span')
            price.id = 'price-'+id
            description = document.createElement('span')
            description.id = 'description-'+id
            date = document.createElement('span')
            category = document.createElement('span')
            category.id = 'category-'+id
            delete_btn = document.createElement('button')
            delete_btn.innerText = 'X'
            confirm_btn = document.createElement('button')
            confirm_btn.innerText = 'Update'
            
            delete_btn.addEventListener("click", (e) => {
                e.target.parentElement.parentElement.parentElement.remove()
                fetch_data('delete/' + id)
                update_ui()
            })
           
            __add_edit_event_listener(category, category.id, id)
            __add_edit_event_listener(price, price.id, id)
            __add_edit_event_listener(description, description.id, id)

            if(test[i]['category'] == 'Income'){
                price.classList.add('income')
            } else {
                price.classList.add('credit')
            }
            price.innerText = `$${test[i]['price']}`
            description.innerText = `${test[i]['description']}`
            date.innerText = `${test[i]['date']}`
            category.innerText = `${test[i]['category']}`

            data_div = document.createElement('div')
            data_div.id = 'data_div'

            modifications_div = document.createElement('div')
            modifications_div.id = 'mod_div'

            data_price_div = document.createElement('div')
            data_price_div.append(date, price)
            data_price_div.id = 'mod_div'

            category_div = document.createElement('div')
            category_div.append(category, description)
            category_div.id = 'mod_div'

            data_div.append(data_price_div)
            modifications_div.append(delete_btn)

            cat_mod_div = document.createElement('div')
            cat_mod_div.append(category_div, modifications_div)
            cat_mod_div.id = 'data_div'


            temp_element.append(data_div, cat_mod_div)
            span_element.append(temp_element)
        }
    }

    document.getElementById('transaction_data').replaceWith(span_element)
}

async function update_budget_data(filter_start, filter_end){
    income = await get_income(filter_start, filter_end)
    invested = await get_invested(filter_start, filter_end)
    spent = await get_spending(filter_start, filter_end)
    const remainder = income - invested - spent
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
   
    Object.entries(category_data).forEach((category) => {
        if(category[0] === 'Income') return;

        const temp_span = document.createElement('span')
        temp_span.innerText = `${category[0]} - $${category[1]}`
        temp_span.classList.add('budgeting_item')
        new_field_set.append(temp_span)
        
    })
    document.getElementById('categories').replaceWith(new_field_set)
}

async function update_ui(){
    filter_start = document.getElementById('filter_start').value
    filter_end = document.getElementById('filter_end').value
    await update_budget_data(filter_start, filter_end)
    await update_category_data(filter_start, filter_end)
    await render_transactions(filter_start, filter_end)
}

function __add_edit_event_listener(element, element_id, id){
    
    element.addEventListener("click", (orgininal_element) => {
        const og_text = element.innerText
        const og_id = element.id
        const og_class = element.classList
        console.log(og_text, og_id)
        const edit_text = document.createElement('input')
        const save_btn = document.createElement('button')

        save_btn.innerText = 'Save'
        const previous_text = orgininal_element.target.innerText
        edit_text.value = previous_text
        edit_text.classList = orgininal_element.target.classList
        edit_text.id = element_id
        
        save_btn.addEventListener('click', (e) => {
            const updated_val = edit_text.value
            const span_text= document.createElement('span')

            span_text.innerText = updated_val
            span_text.id = og_id
            span_text.classList = og_class
            
            __add_edit_event_listener(span_text, element_id, id)
            edit_text.replaceWith(span_text)
            save_btn.remove()
            if(id == null) return;
            data = {
                    'price': get_value_from_element('price-'+id),
                    'description': get_value_from_element('description-'+id),
                    'category': get_value_from_element('category-'+id)
                }
            post_data('update/'+ id, data)
            update_ui()
        })
        element.replaceWith(edit_text, save_btn)
    })
}

function get_value_from_element(element){
    const el = document.getElementById(element);
    const text = el.innerText;
    const val = el.value;

    if (text) return text;
    else return val;

}
function change_date(){
    document.getElementById('filter_start').addEventListener("change", (e) => {
        update_ui()
    })

    document.getElementById('filter_end').addEventListener("change", (e) => {
        update_ui()
    })

    document.getElementById('reset_filter').addEventListener("click", (e) => {
        set_default_date()
        update_ui()
    })
}


function add_transaction(){
    document.getElementById('add_transaction').addEventListener('click', (e) => {
        description = document.getElementById('transaction_description').value
        category = document.getElementById('transaction_category').value
        price = document.getElementById('transaction_price').value
        date = document.getElementById('date_input').value
        data = {
            'description': description,
            'price': price,
            'date': date,
            'category': category
        }
        post_data('add_transaction', data)
        update_ui()
    })
    
}
