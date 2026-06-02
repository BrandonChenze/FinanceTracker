document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
    set_default_date(); // this gets the start and end date
    update_ui()
    change_date()
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
                e.target.parentElement.remove()
                fetch_data('delete/' + id)
            })
            // confirm_btn.addEventListener("click", (e) => {
            //     child_nodes = e.target.parentElement.parentElement.childNodes[0].childNodes
            //     child_nodes.forEach(element => {
            //         if(element instanceof HTMLInputElement){
            //             temp_span = document.createElement('span')
            //             temp_span.innerText = element.value
            //             temp_span.classList = element.classList
            //             __add_edit_event_listener(temp_span)
            //             element.replaceWith(temp_span)
            //         }
            //     });
            //     data = {
            //         'price': document.getElementById('price-'+id).innerText,
            //         'description': document.getElementById('description-'+id).innerText,
            //         'category': child_nodes[3].innerText
            //     }
            //     post_data('update/'+ id, data)
            //     update_ui()
            // })
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
    await update_budget_data(filter_start, filter_end)
    await update_category_data(filter_start, filter_end)
    await render_transactions(filter_start, filter_end)
}

function __add_edit_event_listener(element, element_id, id){
    element.addEventListener("click", (e) => {
        previous_text = e.target.innerText
        edit_text = document.createElement('input')
        edit_text.value = previous_text
        edit_text.classList = e.target.classList
        edit_text.id = element_id
        save_btn = document.createElement('button')
        save_btn.innerText = 'Save'
        save_btn.addEventListener('click', (e) => {
            updated_val = e.target.previousSibling.value
            span_text= document.createElement('span')
            span_text.innerText = updated_val
            span_text.id = e.target.previousSibling.id
            span_text.classList = e.target.previousSibling.classList
            __add_edit_event_listener(span_text, element_id)
            e.target.previousSibling.replaceWith(span_text)
            e.target.remove()
            data = {
                    'price': document.getElementById('price-'+id).innerText,
                    'description': document.getElementById('description-'+id).innerText,
                    'category': document.getElementById('category-'+id).innerText
                }
            console.log(data)
            post_data('update/'+ id, data)
            update_ui()
        })
        e.target.replaceWith(edit_text, save_btn)
    })
}

function change_date(){
    document.getElementById('filter_start').addEventListener("change", (e) => {
        update_ui()
    })

    document.getElementById('filter_end').addEventListener("change", (e) => {
        update_ui()
    })
}


function upload_csv(){
    document.getElementById('upload_csv').addEventListener('click', (e) => {
        f = new FileReader()
        f.onload = function(event){
            console.log(event.target.result)
            text = event.target.result.split('\n')
            confirm_data_btn = document.getElementById('confirm_data_btn')
            text.forEach((e) => {
                if(e.length > 0){
                    transaction_data = document.createElement('span')
                    transaction_data.innerText = e
                    data_div = document.createElement('div')
                    check_box = document.createElement('input')
                    check_box.type = 'checkbox'
                    data_div.append(check_box, transaction_data)
                    document.getElementById('formx').insertBefore(data_div, confirm_data_btn)
                }
            })
        }
        files = document.getElementById('csv_item').files
        if(files.length == 0){
            alert('No files selected')
        } else {
             f.readAsText(files[0])
             document.getElementById('formx').style.visibility = 'visible'
        }
       
    })

    document.getElementById('form_cancel').addEventListener('click', (e) => {
        document.getElementById('formx').style.visibility = 'hidden'
    })
}
upload_csv()