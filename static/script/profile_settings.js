window.addEventListener("DOMContentLoaded", (e) => {
    let change_user_name_btn = document.getElementById("changeUsernameBtn");
    let change_username_dialog = document.getElementById("change-user-name-dialog");
    
    change_username_dialog.querySelector("input[type=reset]").addEventListener("click", (e) => {
        change_username_dialog.close();
    })

    change_username_dialog.querySelector("input[type=submit]").addEventListener("click", async (e) => {
        e.preventDefault();
        let res = await fetch("/api/check-existance",
            {
                method: "POST",
                body:JSON.stringify({
                    "type": "username",
                    "value": change_username_dialog.querySelector("input[name=new_username]").value,
                }),
                headers: {
                    "Accept": "application/json, text/plain, */*",
                    "Content-type": "application/json; charset=UTF-8"
                }
            }
        ).then((resp) => resp.json());
        console.log(res);
        if (!res.exists) {
            change_username_dialog.querySelector("form").submit();
        }
        else {
            alert("Benutzername existiert bereits");
        }
    })

    change_user_name_btn.addEventListener("click", (e) => {
        change_username_dialog.querySelector("input[name=new_username]").value = document.querySelector(".username").innerText.trim();
        change_username_dialog.showModal();
    })
})

window.addEventListener("DOMContentLoaded", (e) => {
    let delete_account_btn = document.getElementById("deleteAccountBtn");
    let delete_acc_dialog = document.getElementById("delete-account-dialog");

    delete_account_btn.addEventListener("click", (e) => {
        delete_acc_dialog.showModal();
        delete_acc_dialog.querySelector("input#password").focus();
    });
});


window.addEventListener("DOMContentLoaded", (e) => {
    let change_password_btn = document.getElementById("changePasswordBtn");
    let change_password_dialog = document.getElementById("change-password-dialog");

    change_password_dialog.querySelector("input[type=reset]").addEventListener("click", (e) => {
        change_password_dialog.close();
    })

    change_password_btn.addEventListener("click", (e) => {
        change_password_dialog.showModal();
        change_password_dialog.querySelector("input").focus();
    });
})
