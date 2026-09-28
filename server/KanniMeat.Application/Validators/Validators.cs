using FluentValidation;

using KanniMeat.Application.DTOs;

namespace KanniMeat.Application.Validators;

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Phone).NotEmpty().WithMessage("Phone is required.")
            .Matches(@"^[0-9+\- ]{8,16}$").WithMessage("Phone format is invalid.");
    }
}

public class PlaceOrderRequestValidator : AbstractValidator<PlaceOrderRequest>
{
    public PlaceOrderRequestValidator()
    {
        RuleFor(x => x.ShopId).NotEmpty();
        RuleFor(x => x.AddressId).NotEmpty();
        RuleFor(x => x.Items).NotEmpty().WithMessage("Order must contain at least one item.");
        RuleForEach(x => x.Items).ChildRules(i =>
        {
            i.RuleFor(x => x.ProductId).NotEmpty();
            i.RuleFor(x => x.WeightKg).GreaterThan(0m).WithMessage("Weight must be greater than zero.");
        });
    }
}

public class AddToCartRequestValidator : AbstractValidator<AddToCartRequest>
{
    public AddToCartRequestValidator()
    {
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.QuantityKg).GreaterThan(0m).WithMessage("Quantity must be greater than zero.")
            .LessThanOrEqualTo(50m).WithMessage("Quantity per line cannot exceed 50 KG.");
    }
}

public class CreateProductRequestValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(160);
        RuleFor(x => x.PricePerKilogram).GreaterThan(0m);
        RuleFor(x => x.ShopId).NotEmpty();
    }
}

public class CreateCompanyRequestValidator : AbstractValidator<CreateCompanyRequest>
{
    public CreateCompanyRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(160);
        RuleFor(x => x.City).NotEmpty().MaximumLength(160);
        RuleFor(x => x.Gstin).MaximumLength(32);
    }
}

public class CreateShopRequestValidator : AbstractValidator<CreateShopRequest>
{
    public CreateShopRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(160);
        RuleFor(x => x.City).NotEmpty().MaximumLength(160);
        RuleFor(x => x.Area).NotEmpty().MaximumLength(160);
        RuleFor(x => x.CompanyId).NotEmpty();
    }
}

public class CreateAddressRequestValidator : AbstractValidator<CreateAddressRequest>
{
    public CreateAddressRequestValidator()
    {
        RuleFor(x => x.Line1).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Area).NotEmpty().MaximumLength(160);
        RuleFor(x => x.City).NotEmpty().MaximumLength(160);
        RuleFor(x => x.Pincode).NotEmpty().Length(6).WithMessage("Pincode must be 6 digits.");
    }
}

public class AssignDeliveryRequestValidator : AbstractValidator<AssignDeliveryRequest>
{
    public AssignDeliveryRequestValidator()
    {
        RuleFor(x => x.OrderId).NotEmpty();
        RuleFor(x => x.DeliveryPartnerId).NotEmpty();
    }
}

public class AdjustInventoryRequestValidator : AbstractValidator<AdjustInventoryRequest>
{
    public AdjustInventoryRequestValidator()
    {
        RuleFor(x => x.InventoryItemId).NotEmpty();
        RuleFor(x => x.QuantityKg).NotEqual(0m).WithMessage("Quantity cannot be zero.");
    }
}

public class RecordPaymentRequestValidator : AbstractValidator<RecordPaymentRequest>
{
    public RecordPaymentRequestValidator()
    {
        RuleFor(x => x.Amount).GreaterThan(0m);
    }
}