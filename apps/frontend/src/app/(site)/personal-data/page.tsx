export default function PersonalDataPage() {
  return (
    <div className="container mx-auto py-12 max-w-3xl">
      <h1 className="text-4xl font-semibold mb-8">Обработка персональных данных</h1>

      <div className="flex flex-col gap-6 text-lg leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold mb-3">1. Оператор персональных данных</h2>
          <p>Оператором персональных данных является сервис Evently, осуществляющий обработку персональных данных в соответствии с Федеральным законом № 152-ФЗ «О персональных данных».</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">2. Состав персональных данных</h2>
          <p>Обработке подлежат следующие персональные данные:</p>
          <ul className="list-disc ml-6 mt-2 flex flex-col gap-1">
            <li>Фамилия, имя;</li>
            <li>Адрес электронной почты;</li>
            <li>Номер телефона (при указании);</li>
            <li>Иные данные, добровольно предоставленные пользователем.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">3. Цели обработки</h2>
          <p>Персональные данные обрабатываются в целях:</p>
          <ul className="list-disc ml-6 mt-2 flex flex-col gap-1">
            <li>Регистрации пользователя и обеспечения доступа к Сервису;</li>
            <li>Оформления и подтверждения записи на мероприятия;</li>
            <li>Информирования пользователя о статусе заявки;</li>
            <li>Исполнения обязательств, предусмотренных пользовательским соглашением.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">4. Правовые основания обработки</h2>
          <p>Обработка персональных данных осуществляется на основании:</p>
          <ul className="list-disc ml-6 mt-2 flex flex-col gap-1">
            <li>Согласия субъекта персональных данных;</li>
            <li>Исполнения договора, стороной которого является субъект персональных данных;</li>
            <li>Требований законодательства Российской Федерации.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">5. Сроки обработки и хранения</h2>
          <p>Персональные данные хранятся в течение срока, необходимого для достижения целей обработки, либо до момента отзыва согласия субъектом персональных данных.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">6. Права субъекта персональных данных</h2>
          <p>Вы вправе:</p>
          <ul className="list-disc ml-6 mt-2 flex flex-col gap-1">
            <li>Получать информацию об обработке своих персональных данных;</li>
            <li>Требовать уточнения, блокирования или уничтожения персональных данных;</li>
            <li>Отозвать согласие на обработку персональных данных;</li>
            <li>Обжаловать действия оператора в уполномоченном органе по защите прав субъектов персональных данных.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">7. Контактная информация</h2>
          <p>По вопросам обработки персональных данных вы можете обратиться по адресу: <span className="font-medium">info@evently.ru</span></p>
        </section>

        <p className="text-muted-foreground">Последнее обновление: январь 2025 г.</p>
      </div>
    </div>
  )
}
