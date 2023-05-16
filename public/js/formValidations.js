function isValidEmail(email) {
// Regular expression for email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
return emailRegex.test(email);
}

function passwordMatch(pass1,pass2){
    if (pass1===pass2){
        return true;
    }
    else{
        return false;
    }
}

function checkPostalCode(number){
    if (/^\d{5}$/.test(parseInt(number))) {
        return true;
    }
    else{
        return false;
    }
}

function checkPhone(number){
    if((/^(\+30|0)?(2\d{9}|69\d{8})$/).test(parseInt(number))){
        return true;
    }
    else{
        return false;
    }
}

function checkTaxID(number){
    if (/^\d{9}$/.test(parseInt(number))) {
        return true;
    }
    else{
        return false;
    }
}

function checkAllInputsFull(formInputs) {
    let allInputsFilled = true;
    
    formInputs.each(function() {
        if ($(this).val() === '') {
        allInputsFilled = false;
        return false; // Exit the loop if an empty input is found
        }
    });
    
    return allInputsFilled;
}

function checkEmail(email) {
    // Regular expression for email validation
    var emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    
    return emailPattern.test(email);
}

function isValidPassword(password) {
    // Regular expression for password validation
    var passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)[a-zA-Z\d\W]{8,}$/;

    return passwordPattern.test(password);
}
  

$("#register-form").submit(function(e){
    $(".error-message").remove()
    e.preventDefault();
        var isValid = true;
        if(!checkAllInputsFull($('#register-form input'))){
            var errorMessage= '<p class="error-message inputs-empty">All inputs should be filled</p>'
            $(".cancel-button").before(errorMessage);
            isValid = false;
        }
        if(!checkEmail($("#register-form #email").val())){
            var errorMessage= '<p class="error-message">Provide a valid email</p>'
            $("#register-form #email").after(errorMessage);
            isValid = false;
        }
        if(!checkTaxID($("#register-form #tax-id").val())){
            var errorMessage= '<p class="error-message">Tax ID should be a 9 digit number</p>'
            $("#register-form #tax-id").after(errorMessage);
            isValid = false;
        }
        if(!checkPostalCode($("#register-form #postal-code").val())){
            var errorMessage= '<p class="error-message">Postal-code should be a 5 digit number</p>'
            $("#register-form #postal-code").after(errorMessage);
            isValid = false;
        }
        if(!checkPhone($("#register-form #phone").val())){
            var errorMessage= '<p class="error-message">Phone should be filled with a valid Greek number number</p>'
            $("#register-form #phone").after(errorMessage);
            isValid = false;
        }
        if(!isValidPassword($("#register-form #password").val())){
            var errorMessage= '<p class="error-message">Password should be at least 8 characters and should contain at list 1 lower case letter, 1 upper case letter, 1 number and 1 symbol</p>'
            $("#register-form #password").after(errorMessage);
            isValid = false;   
        }
        if(!passwordMatch(($("#register-form #password").val()),($("#register-form #password-val").val()))){
            var errorMessage= '<p class="error-message">Passwords should match</p>'
            $("#register-form #password-val").after(errorMessage);
            isValid = false;          
        }
        if(isValid){
            this.submit();
        }
    // }
    // var formInputs = $('#myForm input'); // Select all input elements within the form


    // console.log(passwordMatch(($("#register-form #password")),($("#register-form #password-val"))))
    // console.log(checkTaxID($("#register-form #tax-id").val()))
    // console.log(checkTaxID($("#register-form #postal-code").val()))
    // console.log(checkPhone($("#register-form #phone").val()))
    // console.log(checkAllInputsFull($('#register-form input')));
    // console.log($('#register-form input'))
})