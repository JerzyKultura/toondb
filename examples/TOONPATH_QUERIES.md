# TOONPath Query Examples

Test these queries with the `ecommerce-store.toon` example data.

## Basic Queries

### Get All Items
```
products
customers
orders
```

### Access Nested Data
```
store.name
store.rating
analytics.totalRevenue
```

## Filtering

### Simple Comparisons
```
products.price<100
products.price>200
products.rating>=4.7
customers.orderCount>10
orders.quantity>=2
```

### Boolean Filters
```
products.inStock==true
customers.isPremium==true
orders.shipped==false
inventory.lowStockAlert==true
promotions.active==true
```

### String Filters
```
products.category=='Gaming'
orders.status=='delivered'
shipping.region=='West Coast'
```

### Multiple Conditions (AND)
```
products.price<100 and inStock==true
products.category=='Gaming' and price<100
customers.isPremium==true and totalSpent>2000
orders.status=='delivered' and shipped==true
products.rating>4.5 and sales>500
```

### Multiple Conditions (OR)
```
products.category=='Gaming' or category=='Audio'
orders.status=='processing' or status=='shipped'
customers.orderCount>15 or totalSpent>3000
```

### In Operator
```
products.category in ['Gaming','Audio','Electronics']
orders.status in ['processing','shipped']
customers.isPremium in [true]
```

## Field Selection

### Select Specific Fields
```
products.name,price
customers.name,email,isPremium
orders.customerId,totalPrice,status
```

### Filter + Field Selection
```
products.price<100.name,price,category
customers.isPremium==true.name,totalSpent
orders.status=='delivered'.customerId,totalPrice
products.inStock==true and rating>4.5.name,price,rating
```

## Sorting

### Sort Ascending
```
products sort:price
customers sort:totalSpent
orders sort:orderDate
reviews sort:helpful
```

### Sort Descending
```
products sort:price:desc
customers sort:totalSpent:desc
orders sort:totalPrice:desc
products sort:sales:desc
reviews sort:rating:desc
```

### Filter + Sort
```
products.inStock==true sort:price
customers.isPremium==true sort:totalSpent:desc
orders.status=='delivered' sort:totalPrice:desc
products.category=='Gaming' sort:rating:desc
```

## Limiting

### Simple Limits
```
products limit:5
customers limit:3
orders limit:10
```

### Top N Patterns
```
products sort:sales:desc limit:5
customers sort:totalSpent:desc limit:3
products sort:rating:desc limit:10
reviews sort:helpful:desc limit:5
```

### Filter + Sort + Limit
```
products.inStock==true sort:price limit:5
customers.isPremium==true sort:totalSpent:desc limit:3
orders.status=='delivered' sort:totalPrice:desc limit:10
products.rating>4.5 sort:sales:desc limit:5
```

## Complex Queries

### E-commerce Analytics

**Top 5 best selling products in stock:**
```
products.inStock==true sort:sales:desc limit:5
```

**Premium customers who spent over $2000:**
```
customers.isPremium==true and totalSpent>2000 sort:totalSpent:desc
```

**Affordable gaming products (under $100) in stock:**
```
products.category=='Gaming' and price<100 and inStock==true sort:price
```

**Recent orders pending processing:**
```
orders.status=='processing' sort:orderDate:desc
```

**Highly rated products with lots of sales:**
```
products.rating>=4.7 and sales>400 sort:sales:desc.name,price,rating,sales
```

**Low stock alerts:**
```
inventory.lowStockAlert==true.productId,quantity
```

**Active promotions with good discounts:**
```
promotions.active==true and discount>=20 sort:discount:desc
```

**Top reviewers (most helpful reviews):**
```
reviews.verified==true sort:helpful:desc limit:5.productId,rating,helpful
```

**Premium audio/gaming products:**
```
products.category in ['Audio','Gaming'] and rating>=4.6 sort:rating:desc.name,category,price,rating
```

**Best value products (high rating, low price):**
```
products.rating>=4.6 and price<100 sort:rating:desc.name,price,rating
```

## Field-Specific Queries

### Price Ranges
```
products.price<50
products.price>=50 and price<100
products.price>=100 and price<200
products.price>=200
```

### Rating Categories
```
products.rating>=4.8
products.rating>=4.5 and rating<4.8
products.rating<4.5
```

### Customer Segments
```
customers.totalSpent>=3000
customers.totalSpent>=1500 and totalSpent<3000
customers.totalSpent<1500
customers.orderCount>=10
```

### Order Status
```
orders.status=='delivered' and shipped==true
orders.status=='processing'
orders.status=='shipped'
orders.status=='cancelled'
```

## Join-Like Queries (Manual)

To query related data, run multiple queries:

**Get orders for a specific customer:**
```
orders.customerId==1
```

**Then get that customer's info:**
```
customers.id==1
```

**Get products in Gaming category:**
```
products.category=='Gaming'
```

**Get reviews for high-rated products:**
```
reviews.rating==5
```

**Then check those product IDs in products:**
```
products.id==7
```

## Testing Checklist

Test each feature:
- [ ] Basic path access (products, customers, etc.)
- [ ] Nested access (store.name, analytics.totalRevenue)
- [ ] All comparison operators (==, !=, <, >, <=, >=)
- [ ] Logical operators (and, or)
- [ ] In operator
- [ ] Field selection
- [ ] Sorting (ascending and descending)
- [ ] Limiting
- [ ] Complex combined queries
- [ ] Error handling (invalid paths, syntax errors)

## Performance Testing

Test with different query complexities:
1. Simple: `products`
2. Medium: `products.price<100 sort:price`
3. Complex: `products.inStock==true and rating>=4.5 sort:sales:desc limit:5.name,price,rating`

Measure execution times and verify results are correct.

