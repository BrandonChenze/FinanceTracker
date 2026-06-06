function clear_form(){
    data_to_add = document.getElementsByClassName('testing123')
    while(data_to_add.length > 0 ){
        data_to_add[0].parentElement.remove()
    }
}

function upload_csv(){
    const upload_btn = document.getElementById('upload_csv')
    const confirm_data_btn = document.getElementById('confirm_data_btn')
    const data_form = document.getElementById('formx')
    const files_input = document.getElementById('csv_item')
    const cancel_btn = document.getElementById('form_cancel')

    upload_btn.addEventListener('click', (e) => {
        reader = new FileReader()
        reader.onload = function(event){
            text = event.target.result.split('\n')
            
            let id = 0
            text.forEach((line) => {
                if(line.length === 0) return;
                
                const split_transaction = line.split(',')
                
                const date = clean_text(split_transaction[0])
                const price = clean_text(split_transaction[1])
                const description = clean_text(split_transaction[2])
                const category = clean_text(split_transaction[3])
                
                if(price[0] !== '-') return;

                // Create elements
                const transaction = {
                    id,
                    date,
                    price,
                    description,
                    category
                }
                create_form_transaction(transaction, data_form, confirm_data_btn)
                
                id++;
                
            })
        }
        if(files_input.files.length == 0){
            alert('No files selected')
        } else {
             reader.readAsText(files_input.files[0])
             data_form.style.visibility = 'visible'
        }
       
    })

    confirm_data_btn.addEventListener('click', (e) => {
        handle_form_confirm(data_form)
        clear_form()
    })

    cancel_btn.addEventListener('click', (e) => {
        document.getElementById('formx').style.visibility = 'hidden'
        clear_form()
    })
}

function handle_form_confirm(data_form){
    data_form.style.visibility = 'hidden'
    data_to_add = document.getElementsByClassName('testing123')
    for(i = 0; i < data_to_add.length; i++){
        if(document.getElementById('checkbox-' + data_to_add[i].id).checked === false) continue;
        
        transaction_data = data_to_add[i].innerHTML.split('--')
        data = {
            'date': transaction_data[0],
            'price': transaction_data[1],
            'description': transaction_data[2],
            'category': transaction_data[3]
        }
        post_data('add_transaction', data)
        update_ui()
        
    }
}

function create_form_transaction(tx, data_form, confirm_data_btn){
    const transaction_data = document.createElement('span');
    transaction_data.classList.add('testing123');
    transaction_data.id = tx.id;
    transaction_data.innerText = `${tx.date} -- ${tx.price} -- ${tx.description} -- ${tx.category}`;

    __add_edit_event_listener(transaction_data, transaction_data.id);

    const check_box = document.createElement('input');
    check_box.checked = false;
    check_box.type = 'checkbox';
    check_box.id = `checkbox-${tx.id}`;

    const data_div = document.createElement('div');
    data_div.append(check_box, transaction_data)
    data_div.classList.add("tran_data")
    data_form.insertBefore(data_div, confirm_data_btn)
}

function clean_text(value){
    return value.replaceAll('"', '').trim()
}