# ใช้ Node.js 22.12 เป็น base image
FROM node:22.12

# กำหนด working directory
WORKDIR /app

# รับ build argument สำหรับไฟล์ .env
ARG ENV_FILE_CONTENT

# สร้างไฟล์ .env จาก build argument (ถ้ามีค่า) 
RUN if [ -n "$ENV_FILE_CONTENT" ]; then \
      printf "%s" "$ENV_FILE_CONTENT" > .env; \
    else \
      echo "No ENV_FILE_CONTENT provided" > .env; \
    fi

# คัดลอกไฟล์ package.json และ package-lock.json
COPY package.json package-lock.json ./

# ติดตั้ง dependencies (เฉพาะ production dependencies เพื่อลดขนาด image)
RUN npm install --omit=dev

# ติดตั้ง dependencies เพิ่มเติมที่จำเป็น
RUN npm install node-cron
RUN npm install pg --save

# รัน build script (โดย build นี้จะอ่านไฟล์ .env ที่สร้างไว้แล้ว)
RUN npm run build

# คัดลอกโค้ดทั้งหมดไปยัง container
COPY . .

# กำหนดพอร์ตที่ใช้
EXPOSE 80

# คำสั่งสำหรับรัน Strapi
CMD ["npm", "start"]
