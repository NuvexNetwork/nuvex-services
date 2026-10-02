terraform {
  required_version = ">= 1.9.0"
}

variable "environment" {
  type        = string
  description = "localnet, devnet, or mainnet. No resources are declared."

  validation {
    condition     = contains(["localnet", "devnet", "mainnet"], var.environment)
    error_message = "environment must be localnet, devnet, or mainnet."
  }
}
