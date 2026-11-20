pub fn verify_booking_confirmation_prerequisites(paid: bool, inventory_allocated: bool, fraud_checked: bool) -> bool {
    paid && inventory_allocated && fraud_checked
}

pub fn send_confirmation(paid: bool, inventory_allocated: bool, fraud_checked: bool) -> Result<&'static str, &'static str> {
    if verify_booking_confirmation_prerequisites(paid, inventory_allocated, fraud_checked) {
        Ok("Confirmation notification sent")
    } else {
        Err("Prerequisites not satisfied: cannot send premature confirmation")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_normal_path_confirmation() {
        let result = send_confirmation(true, true, true);
        assert_eq!(result, Ok("Confirmation notification sent"));
    }

    #[test]
    fn test_premature_confirmation_failures() {
        assert!(send_confirmation(false, true, true).is_err());
        assert!(send_confirmation(true, false, true).is_err());
        assert!(send_confirmation(true, true, false).is_err());
        assert!(send_confirmation(false, false, false).is_err());
    }
}
