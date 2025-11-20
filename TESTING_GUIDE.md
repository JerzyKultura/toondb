# ToonDB Testing Guide

## ✅ Setup Complete!

Your ToonDB is now ready to use. Here's how to test it:

## 🚀 Start the Application

```bash
npm run dev
```

Visit: http://localhost:3000

## 🧪 Test Creating a Table

1. **Go to the dashboard**: http://localhost:3000/dashboard

2. **Click "New Table"** button

3. **Fill in the form:**
   - **Name**: `users`
   - **Description**: `Sample user data`
   - **TOON Content**:
     ```
     users[3]{id,name,role}:
       1,Alice,admin
       2,Bob,user
       3,Charlie,user
     ```

4. **Click "Create Table"**

5. **You should see** your new table in the dashboard!

## 📊 More Examples to Try

### Products Table

```
products[4]{id,name,price,stock}:
  101,Widget,9.99,50
  102,Gadget,14.50,25
  103,Tool,7.25,100
  104,Device,29.99,10
```

### Orders Table

```
orders[2]{order_id,customer,total,status}:
  1001,"John Doe",45.50,shipped
  1002,"Jane Smith",89.99,pending
```

### Mixed Data Example

```
blog_posts[2]{id,title,author,published}:
  1,"Getting Started with TOON","Alice",2024-01-15
  2,"Advanced TOON Techniques","Bob",2024-01-20
```

## 🎯 What to Test

- ✅ Create tables with different data types
- ✅ View tables in the dashboard
- ✅ Check row counts
- ✅ Try different delimiters (comma, tab, pipe)
- ✅ Test with empty descriptions
- ✅ Try creating tables with the same name (should fail with error)

## 🐛 Known Limitations (Demo Mode)

⚠️ **This is currently in DEMO MODE** - authentication is disabled for testing.

**What this means:**
- No user login required
- All data is public
- No user-specific data isolation
- Anyone can view/create/delete tables

**For production use**, you'll need to:
1. Set up proper authentication (see `SETUP_FIXES.md`)
2. Remove the demo mode migration
3. Enable proper RLS policies

## 🔍 Checking Your Data

You can view your data in Supabase:

1. Go to https://app.supabase.com
2. Select your project
3. Go to **Table Editor**
4. Select `toon_tables`
5. See all your created tables!

## 📝 API Testing

You can also test the API directly:

```bash
# List all tables
curl http://localhost:3000/api/tables

# Create a table
curl -X POST http://localhost:3000/api/tables \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test_table",
    "description": "Testing via API",
    "toon_content": "test[2]{id,value}:\n  1,foo\n  2,bar",
    "delimiter": ","
  }'
```

## 🎉 Success Checklist

- [ ] Application runs at http://localhost:3000
- [ ] Can access dashboard at http://localhost:3000/dashboard
- [ ] Can click "New Table" button
- [ ] Can create a table with TOON content
- [ ] New table appears in dashboard
- [ ] Can see row count and creation date
- [ ] Data is stored in Supabase (check Table Editor)

## 🆘 Troubleshooting

### Error: "Failed to create table"
- Check your TOON format is correct
- Make sure you have `[count]{fields}:` header
- Check for syntax errors (missing commas, wrong delimiters)

### Error: "Table already exists"
- Use a different table name
- Or delete the existing table from Supabase dashboard

### 404 Error on pages
- Make sure development server is running (`npm run dev`)
- Check you're on the correct URL

### Database connection errors
- Verify `.env` file has correct Supabase credentials
- Check Supabase project is active
- Run `npx supabase status` to verify connection

## 📚 Next Steps

Once testing is complete:

1. **Add Authentication**: Follow the authentication setup guide
2. **Deploy to Production**: See `docs/DEPLOYMENT.md`
3. **Build Your App**: Use the SDKs to integrate ToonDB
4. **Explore Examples**: Check `examples/` folder

Happy testing! 🎒

